// Does the overlay actually land on the ground it was given?
//
// These assert geometry rather than exact transform strings: the video's own
// four corners are mapped through its computed CSS transform and compared with
// where Leaflet says those coordinates are. That catches a wrong matrix, a
// dropped update and a NaN without being brittle about formatting.
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

async function open(query) {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    await page.goto(`${server.origin}/test/fixtures/overlay.html?${query}`, { waitUntil: 'load' });
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

describe('rendering', () => {
    test('a general quad lands on its four corners', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners');
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
        const { context, page } = await open('shape=bounds');
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
        const { context, page } = await open('shape=corners&hidden=1');
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

    test('panning and zooming keep the overlay on its corners', async (t) => {
        if (unavailable) return t.skip(unavailable);
        const { context, page } = await open('shape=corners');
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
