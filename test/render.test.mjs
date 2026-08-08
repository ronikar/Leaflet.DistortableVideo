// Does the overlay actually land on the ground it was given?
//
// These assert geometry rather than exact transform strings: the video's own
// four corners are mapped through its computed CSS transform and compared with
// where Leaflet says those coordinates are. That catches a wrong matrix, a
// dropped update and a NaN without being brittle about formatting.
//
// Every test runs against both Leaflet majors from the one build, because that
// dual support is a promise the package makes and the two differ in ways this
// code touches - Leaflet 2 dropped the lowercase factories and ships an ES
// module by default.
//
// Skipped when playwright or its browser is missing, so `npm test` still works
// on a machine that has not run `npx playwright install chromium` - but never in
// CI, where a silent skip would turn a broken browser into a green build and
// quietly stop protecting anything.

import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve } from './helpers/server.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWPORT = { width: 1000, height: 700 };
const TOLERANCE = 3; // px

let chromium, browser, server, unavailable;

before(async () => {
    try {
        ({ chromium } = await import('playwright'));
        browser = await chromium.launch();
    } catch (error) {
        const why = `playwright unavailable: ${error.message.split('\n')[0]}`;
        if (process.env.CI) throw new Error(`${why} - refusing to skip the render tests in CI`);
        unavailable = why;
        return;
    }
    server = await serve(root);
});

after(async () => {
    await browser?.close();
    await server?.close();
});

const LEAFLET_MAJORS = ['1', '2'];

async function open(query, major) {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    await page.goto(`${server.origin}/test/fixtures/overlay.html?leaflet=${major}&${query}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true);
    await page.waitForFunction(() => {
        const v = document.querySelector('#map video');
        return v && v.readyState >= 2;
    }, null, { timeout: 20000 });
    return { context, page };
}

/**
 * Map the video element's own corners through its computed transform and return
 * how far each lands from where Leaflet places that coordinate.
 */
function cornerErrors(page) {
    return page.evaluate(() => {
        const video = document.querySelector('#map video');
        const matrix = new DOMMatrix(getComputedStyle(video).transform);
        const width = parseFloat(video.style.width);
        const height = parseFloat(video.style.height);

        const pane = video.parentElement.getBoundingClientRect();
        const container = window.__map.getContainer().getBoundingClientRect();

        const project = (x, y) => {
            const p = matrix.transformPoint(new DOMPoint(x, y));
            const w = p.w || 1;
            return { x: p.x / w + pane.left, y: p.y / w + pane.top };
        };

        const order = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
        const drawn = [project(0, 0), project(width, 0), project(width, height), project(0, height)];

        return order.map((name, i) => {
            const expected = window.__map.latLngToContainerPoint(window.__corners[name]);
            return Math.hypot(drawn[i].x - (container.left + expected.x),
                              drawn[i].y - (container.top + expected.y));
        });
    });
}

for (const major of LEAFLET_MAJORS) describe(`rendering (Leaflet ${major})`, () => {
    test('a general quad lands on its four corners', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners', major);
        try {
            const transform = await page.evaluate(() => getComputedStyle(document.querySelector('#map video')).transform);
            assert.doesNotMatch(transform, /NaN|Infinity/, 'transform must be finite');
            assert.notEqual(transform, 'none', 'a transform must be applied');

            for (const [i, error] of (await cornerErrors(page)).entries()) {
                assert.ok(error <= TOLERANCE, `corner ${i} is ${error.toFixed(1)}px out (max ${TOLERANCE})`);
            }
            assert.deepEqual(await page.evaluate(() => window.__errors), []);
        } finally { await context.close(); }
    });

    test('an axis-aligned box still renders', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=bounds', major);
        try {
            const transform = await page.evaluate(() => getComputedStyle(document.querySelector('#map video')).transform);
            assert.doesNotMatch(transform, /NaN|Infinity/);
            assert.notEqual(transform, 'none');
            assert.deepEqual(await page.evaluate(() => window.__errors), []);
        } finally { await context.close(); }
    });

    // 1.0.0: getEvents never bound resize, so the first _reset bailed on a 0x0
    // viewport and nothing retried. The video kept no transform and no size.
    test('a map built in a hidden container recovers when shown', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners&hidden=1', major);
        try {
            assert.equal(await page.evaluate(() => document.querySelector('#map video').style.transform), '',
                'precondition: nothing is drawn while the container is hidden');

            await page.evaluate(() => {
                document.getElementById('wrap').className = '';
                window.__map.invalidateSize();
            });
            await page.waitForFunction(() => {
                const t = document.querySelector('#map video').style.transform;
                return t !== '' && !t.includes('NaN');
            }, null, { timeout: 10000 });

            const transform = await page.evaluate(() => getComputedStyle(document.querySelector('#map video')).transform);
            assert.notEqual(transform, 'none', 'a transform must be applied once the container has a size');
            assert.doesNotMatch(transform, /NaN|Infinity/);

            for (const [i, error] of (await cornerErrors(page)).entries()) {
                assert.ok(error <= TOLERANCE, `corner ${i} is ${error.toFixed(1)}px out after reveal`);
            }
        } finally { await context.close(); }
    });

    // Three corners on one line: distinct, so areSomeCornersEqual passes it to the
    // projective solver, whose determinant is zero. Before the guard this produced
    // matrix3d(Infinity, ...), which the browser rejects wholesale - the video lost
    // its transform and painted at viewport size over the top-left of the map.
    test('a collapsed quad falls back instead of emitting a broken matrix', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=degenerate', major);
        try {
            const transform = await page.evaluate(() => getComputedStyle(document.querySelector('#map video')).transform);
            assert.doesNotMatch(transform, /NaN|Infinity/, 'a degenerate quad must not produce a broken matrix');
            assert.notEqual(transform, 'none', 'the browser must have accepted the transform');
            assert.deepEqual(await page.evaluate(() => window.__errors), []);
        } finally { await context.close(); }
    });

    test('panning and zooming keep the overlay on its corners', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners', major);
        try {
            const before = await page.evaluate(() => document.querySelector('#map video').style.transform);
            await page.evaluate(() => {
                window.__map.panBy([180, 120], { animate: false });
                window.__map.setZoom(window.__map.getZoom() + 1, { animate: false });
            });
            await page.waitForFunction(
                (previous) => document.querySelector('#map video').style.transform !== previous,
                before, { timeout: 10000 });

            for (const [i, error] of (await cornerErrors(page)).entries()) {
                assert.ok(error <= TOLERANCE, `corner ${i} is ${error.toFixed(1)}px out after pan and zoom`);
            }
        } finally { await context.close(); }
    });
});

// _bounds used to hold the plain corners object the projection wants, so every
// inherited method that expected a LatLngBounds threw on it.
for (const major of LEAFLET_MAJORS) describe(`layer api (Leaflet ${major})`, () => {
    test('getBounds returns a real LatLngBounds around the corners', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners', major);
        try {
            const result = await page.evaluate(() => {
                const bounds = window.__layer.getBounds();
                const c = window.__corners;
                return {
                    version: window.__leafletVersion,
                    isLatLngBounds: bounds instanceof L.LatLngBounds,
                    north: bounds.getNorth(), south: bounds.getSouth(),
                    east: bounds.getEast(), west: bounds.getWest(),
                    expected: {
                        north: Math.max(c.topLeft.lat, c.topRight.lat, c.bottomRight.lat, c.bottomLeft.lat),
                        south: Math.min(c.topLeft.lat, c.topRight.lat, c.bottomRight.lat, c.bottomLeft.lat),
                        east: Math.max(c.topLeft.lng, c.topRight.lng, c.bottomRight.lng, c.bottomLeft.lng),
                        west: Math.min(c.topLeft.lng, c.topRight.lng, c.bottomRight.lng, c.bottomLeft.lng),
                    },
                };
            });

            assert.ok(result.version.startsWith(major), `fixture must be running Leaflet ${major}, got ${result.version}`);
            assert.ok(result.isLatLngBounds, 'getBounds() must return a LatLngBounds');
            for (const edge of ['north', 'south', 'east', 'west']) {
                assert.equal(result[edge], result.expected[edge], `${edge} edge must hug the corners`);
            }
        } finally { await context.close(); }
    });

    test('the inherited LatLngBounds consumers all work', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners', major);
        try {
            const failures = await page.evaluate(() => {
                const layer = window.__layer, map = window.__map, bad = [];
                const checks = {
                    'getBounds().getCenter()': () => layer.getBounds().getCenter(),
                    'getBounds().contains()': () => layer.getBounds().contains(new L.LatLng(20, -115)),
                    'getCenter()': () => layer.getCenter(),
                    'map.fitBounds(getBounds())': () => map.fitBounds(layer.getBounds()),
                    'bindPopup + openPopup': () => { layer.bindPopup('x'); layer.openPopup(); },
                    'featureGroup.getBounds()': () => new L.FeatureGroup([layer]).getBounds(),
                };
                for (const [name, fn] of Object.entries(checks)) {
                    try { fn(); } catch (e) { bad.push(`${name}: ${e.message.split('\n')[0]}`); }
                }
                return bad;
            });

            assert.deepEqual(failures, [], 'no inherited LatLngBounds consumer may throw');
        } finally { await context.close(); }
    });

    test('getCorners round-trips the quad that getBounds cannot express', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners', major);
        try {
            const result = await page.evaluate(() => {
                const corners = window.__layer.getCorners();
                const same = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].every((k) =>
                    corners[k].lat === window.__corners[k].lat && corners[k].lng === window.__corners[k].lng);

                // The hull is not the quad: its north-west is a point no corner
                // sits on, which is exactly what getBounds() alone cannot express.
                const northWest = window.__layer.getBounds().getNorthWest();
                const hullIsWider = northWest.lat !== corners.topLeft.lat
                    || northWest.lng !== corners.topLeft.lng;

                return { same, hullIsWider };
            });

            assert.ok(result.same, 'getCorners() must return the corners as given');
            assert.ok(result.hullIsWider, 'precondition: the fixture quad is not axis-aligned');
        } finally { await context.close(); }
    });

    test('setBounds and setCorners both keep _bounds a LatLngBounds', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners', major);
        try {
            const result = await page.evaluate(() => {
                const layer = window.__layer;

                layer.setBounds([[10, -120], [30, -100]]);
                const afterBounds = layer.getBounds() instanceof L.LatLngBounds;
                const boundsCentre = layer.getCenter();

                layer.setCorners({
                    topLeft: new L.LatLng(31, -128), topRight: new L.LatLng(33, -101),
                    bottomRight: new L.LatLng(14, -98), bottomLeft: new L.LatLng(12, -131),
                });
                const afterCorners = layer.getBounds() instanceof L.LatLngBounds;

                return {
                    afterBounds, afterCorners,
                    boundsCentre: [boundsCentre.lat, boundsCentre.lng],
                    north: layer.getBounds().getNorth(),
                    transform: document.querySelector('#map video').style.transform,
                };
            });

            assert.ok(result.afterBounds, 'setBounds() must leave a LatLngBounds behind');
            assert.ok(result.afterCorners, 'setCorners() must leave a LatLngBounds behind');
            assert.deepEqual(result.boundsCentre, [20, -110], 'centre of the box passed to setBounds');
            assert.equal(result.north, 33, 'bounds must track the new corners');
            assert.doesNotMatch(result.transform, /NaN|Infinity/);
        } finally { await context.close(); }
    });
});
