#!/usr/bin/env node
//
// Builds a demo video for the examples from NASA GIBS satellite imagery, and
// prints the four geographic corners it should be displayed at.
//
// Why generate rather than hotlink: a video is only a useful demo for this
// plugin if its geographic footprint is known exactly. Requesting the imagery
// for a footprint we chose means the corners are exact by construction, so the
// coastlines in the video line up with the coastlines on the basemap instead of
// approximately matching.
//
// Everything is computed in Web Mercator (EPSG:3857) because that is what
// Leaflet renders in. A rectangle in Mercator maps to a parallelogram on screen
// under an affine transform, which the plugin reproduces exactly. Doing the same
// work in plate carree would drift with latitude.
//
// With --rotate, the imagery is turned so the video is not north-up. That is the
// interesting case: the overlay then needs a genuine rotation to land correctly,
// exercising the projective path rather than a plain scale-and-translate.
//
// Requires ffmpeg on PATH. Node 18+ (uses global fetch).
//
//   node tools/make-demo-video.mjs --bounds 13,-130,32,-100 --rotate 30 \
//        --dates 2024-10-08..2024-10-15 --out examples/media/rotated.mp4
//
// See `node tools/make-demo-video.mjs --help`.

import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const GIBS = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi';
const EARTH_RADIUS = 6378137;

// ── Web Mercator ─────────────────────────────────────────────────────────────
const lonToX = (lon) => EARTH_RADIUS * lon * Math.PI / 180;
const latToY = (lat) => EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
const xToLon = (x) => (x / EARTH_RADIUS) * 180 / Math.PI;
const yToLat = (y) => (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * 180 / Math.PI;

// ── Arguments ────────────────────────────────────────────────────────────────
const DEFAULTS = {
    bounds: '13,-130,32,-100',
    rotate: 30,
    layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    dates: '2024-10-08..2024-10-15',
    width: 1024,
    fps: 4,
    crf: 30,
    out: 'examples/media/rotated.mp4'
};

const HELP = `
Build a demo video from NASA GIBS imagery with an exactly known footprint.

  --bounds  S,W,N,E   footprint before rotation      (default ${DEFAULTS.bounds})
  --rotate  degrees   turn the imagery off north-up  (default ${DEFAULTS.rotate}, 0 = north-up)
  --layer   name      any GIBS EPSG:3857 layer       (default ${DEFAULTS.layer})
  --dates   spec      "a,b,c" or "start..end" daily  (default ${DEFAULTS.dates})
  --width   px        output video width             (default ${DEFAULTS.width})
  --fps     n         frames per second              (default ${DEFAULTS.fps})
  --crf     n         x264 quality, lower is bigger  (default ${DEFAULTS.crf})
  --out     path      output .mp4                    (default ${DEFAULTS.out})

Writes the video plus a .json sidecar holding the corners and how they were
produced, and prints a snippet ready to paste into an example page.
`;

function parseArgs(argv) {
    const options = { ...DEFAULTS };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') { console.log(HELP); process.exit(0); }
        if (!arg.startsWith('--')) throw new Error(`unexpected argument: ${arg}`);
        const key = arg.slice(2);
        if (!(key in DEFAULTS)) throw new Error(`unknown option: ${arg}`);
        const value = argv[++i];
        if (value === undefined) throw new Error(`${arg} needs a value`);
        options[key] = typeof DEFAULTS[key] === 'number' ? Number(value) : value;
        if (typeof DEFAULTS[key] === 'number' && !Number.isFinite(options[key])) {
            throw new Error(`${arg} needs a number, got "${value}"`);
        }
    }
    return options;
}

// "2024-10-08..2024-10-15" -> every day in that range; "a,b" -> exactly those.
function expandDates(spec) {
    if (!spec.includes('..')) return spec.split(',').map((d) => d.trim()).filter(Boolean);

    const [from, to] = spec.split('..');
    const start = new Date(`${from.trim()}T00:00:00Z`);
    const end = new Date(`${to.trim()}T00:00:00Z`);
    if (Number.isNaN(+start) || Number.isNaN(+end)) throw new Error(`bad --dates range: ${spec}`);
    if (end < start) throw new Error(`--dates range runs backwards: ${spec}`);

    const dates = [];
    for (let t = +start; t <= +end; t += 86400000) dates.push(new Date(t).toISOString().slice(0, 10));
    return dates;
}

// ── Geometry ─────────────────────────────────────────────────────────────────
//
// The footprint is a rectangle in Mercator, rotated about its own centre. We ask
// GIBS for the axis-aligned box that contains it, then rotate that image back so
// the footprint becomes upright and crop to it.
function planFootprint({ bounds, rotate, width }) {
    const [south, west, north, east] = bounds.split(',').map(Number);
    if ([south, west, north, east].some((n) => !Number.isFinite(n))) {
        throw new Error(`--bounds needs four numbers "S,W,N,E", got "${bounds}"`);
    }

    const x0 = lonToX(west), x1 = lonToX(east);
    const y0 = latToY(south), y1 = latToY(north);
    const centre = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
    const half = { x: Math.abs(x1 - x0) / 2, y: Math.abs(y1 - y0) / 2 };

    const theta = rotate * Math.PI / 180;
    const cos = Math.cos(theta), sin = Math.sin(theta);

    // Footprint corners in the video's own frame, clockwise from its top-left,
    // rotated into map space. y is northward here.
    const corner = (sx, sy) => ({
        x: centre.x + (sx * half.x) * cos - (sy * half.y) * sin,
        y: centre.y + (sx * half.x) * sin + (sy * half.y) * cos
    });
    const footprint = {
        topLeft: corner(-1, 1),
        topRight: corner(1, 1),
        bottomRight: corner(1, -1),
        bottomLeft: corner(-1, -1)
    };

    // Axis-aligned box that contains the rotated footprint - this is what we fetch.
    // The tight bound touches the footprint's corners exactly, so after rotating
    // back, rounding leaks a few fill pixels into the crop. A small margin keeps
    // the crop strictly inside real imagery.
    const MARGIN = 1.02;
    const outerHalf = {
        x: (Math.abs(half.x * cos) + Math.abs(half.y * sin)) * MARGIN,
        y: (Math.abs(half.x * sin) + Math.abs(half.y * cos)) * MARGIN
    };
    const request = {
        minX: centre.x - outerHalf.x, maxX: centre.x + outerHalf.x,
        minY: centre.y - outerHalf.y, maxY: centre.y + outerHalf.y
    };

    // Resolution is set so the *cropped* video ends up `width` pixels wide.
    const metresPerPixel = (2 * half.x) / width;
    const source = {
        width: Math.round((2 * outerHalf.x) / metresPerPixel),
        height: Math.round((2 * outerHalf.y) / metresPerPixel)
    };
    // h264 needs even dimensions.
    const crop = {
        width: 2 * Math.round(half.x / metresPerPixel),
        height: 2 * Math.round(half.y / metresPerPixel)
    };

    const toLatLng = (p) => ({ lat: +yToLat(p.y).toFixed(6), lng: +xToLon(p.x).toFixed(6) });
    return {
        request, source, crop, theta,
        corners: {
            topLeft: toLatLng(footprint.topLeft),
            topRight: toLatLng(footprint.topRight),
            bottomRight: toLatLng(footprint.bottomRight),
            bottomLeft: toLatLng(footprint.bottomLeft)
        }
    };
}

// ── Fetching ─────────────────────────────────────────────────────────────────
async function fetchFrame({ layer, date, request, source }) {
    const url = new URL(GIBS);
    url.search = new URLSearchParams({
        SERVICE: 'WMS', REQUEST: 'GetMap', VERSION: '1.3.0',
        LAYERS: layer, CRS: 'EPSG:3857', FORMAT: 'image/jpeg',
        WIDTH: String(source.width), HEIGHT: String(source.height),
        BBOX: `${request.minX},${request.minY},${request.maxX},${request.maxY}`,
        TIME: date
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`GIBS returned ${response.status} for ${date}`);
    const bytes = Buffer.from(await response.arrayBuffer());

    // GIBS answers 200 with a near-empty tile when a layer has no data for the
    // requested date - geostationary layers only keep a short rolling window.
    // Catching it here beats silently encoding blank frames.
    if (bytes.length < 8000) {
        throw new Error(`GIBS returned a blank frame for ${date} (${bytes.length} bytes). ` +
            `The layer probably has no imagery for that date.`);
    }
    return bytes;
}

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
        let stderr = '';
        child.stderr.on('data', (chunk) => { stderr += chunk; });
        child.on('error', (error) => reject(
            error.code === 'ENOENT' ? new Error(`${command} not found on PATH`) : error));
        child.on('close', (code) => code === 0
            ? resolve()
            : reject(new Error(`${command} exited ${code}\n${stderr.split('\n').slice(-12).join('\n')}`)));
    });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    const options = parseArgs(process.argv.slice(2));
    const dates = expandDates(options.dates);
    const plan = planFootprint(options);

    console.log(`layer      ${options.layer}`);
    console.log(`frames     ${dates.length} (${dates[0]} .. ${dates[dates.length - 1]})`);
    console.log(`rotation   ${options.rotate}°`);
    console.log(`fetching   ${plan.source.width}×${plan.source.height} → cropping to ${plan.crop.width}×${plan.crop.height}`);

    const scratch = join(tmpdir(), `gibs-${process.pid}`);
    await mkdir(scratch, { recursive: true });

    try {
        for (const [index, date] of dates.entries()) {
            const bytes = await fetchFrame({ ...options, date, ...plan });
            await writeFile(join(scratch, `f${String(index).padStart(4, '0')}.jpg`), bytes);
            process.stdout.write(`\r           ${index + 1}/${dates.length} fetched`);
        }
        process.stdout.write('\n');

        await mkdir(dirname(options.out), { recursive: true });

        // Rotate the fetched image so the footprint becomes upright, then crop to
        // it. ffmpeg's rotate takes radians; the sign is +theta because image y
        // runs opposite to map y, which flips the sense of the map-space rotation.
        // Verified by overlaying the result on a basemap - the other sign lands
        // the footage 2*theta out.
        const filters = [
            `rotate=${plan.theta.toFixed(9)}:ow=iw:oh=ih:c=black`,
            `crop=${plan.crop.width}:${plan.crop.height}`
        ].join(',');

        await run('ffmpeg', [
            '-y', '-loglevel', 'error',
            '-framerate', String(options.fps),
            '-i', join(scratch, 'f%04d.jpg'),
            '-vf', filters,
            '-c:v', 'libx264', '-crf', String(options.crf),
            '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
            options.out
        ]);

        const sidecar = {
            source: 'NASA Global Imagery Browse Services (GIBS), public domain',
            layer: options.layer,
            dates,
            boundsBeforeRotation: options.bounds,
            rotationDegrees: options.rotate,
            generatedBy: 'tools/make-demo-video.mjs',
            corners: plan.corners
        };
        await writeFile(`${options.out.replace(/\.mp4$/, '')}.json`, JSON.stringify(sidecar, null, 2) + '\n');

        const { topLeft, topRight, bottomRight, bottomLeft } = plan.corners;
        const line = (name, c) => `    ${name}: L.latLng([${c.lat}, ${c.lng}]),`;
        console.log(`\nwrote      ${options.out}`);
        console.log(`\nCorners to display it at:\n`);
        console.log('  var corners = {');
        console.log(line('topLeft', topLeft));
        console.log(line('topRight', topRight));
        console.log(line('bottomRight', bottomRight));
        console.log(line('bottomLeft', bottomLeft).replace(/,$/, ''));
        console.log('  };');
    } finally {
        await rm(scratch, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(`\nmake-demo-video: ${error.message}`);
    process.exit(1);
});
