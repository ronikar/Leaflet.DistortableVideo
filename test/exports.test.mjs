// What a consumer gets from the built bundle, and that registering on L can
// never crash again.
//
// 1.0.0 threw on require() whenever Leaflet resolved as a real ES module,
// because a module namespace is non-extensible and the plugin assigned onto it.
// Rather than install two Leaflet majors, these tests hand the UMD a stub L
// through the module loader - a frozen one to stand in for an ES namespace, an
// ordinary object to stand in for Leaflet 1.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Minimal stand-in for the Leaflet surface the plugin touches at load time. */
function leafletStub() {
    class VideoOverlay {
        static extend(props) {
            const Sub = class extends VideoOverlay { };
            Object.assign(Sub.prototype, props);
            return Sub;
        }
        getEvents() { return { zoom: null, viewreset: null, zoomanim: null }; }
    }
    VideoOverlay.prototype._initImage = () => { };
    return { VideoOverlay, Util: { setOptions() { } }, LatLngBounds: class { } };
}

/** Load dist/<file> with require('leaflet') resolving to `stub`. */
function loadWithLeaflet(file, stub) {
    const path = join(root, 'dist', file);
    const original = Module._load;
    Module._load = function (request, ...rest) {
        if (request === 'leaflet') return stub;
        return original.call(this, request, ...rest);
    };
    try {
        delete require.cache[require.resolve(path)];
        return require(path);
    } finally {
        Module._load = original;
    }
}

for (const file of ['index.js', 'index.min.js']) {
    test(`${file}: exports the factory and the class`, () => {
        const m = loadWithLeaflet(file, leafletStub());

        assert.equal(typeof m.distortableVideoOverlay, 'function', 'named factory');
        assert.equal(typeof m.DistortableVideoOverlay, 'function', 'named class');
        assert.equal(m.default, m.distortableVideoOverlay, 'default is the factory');
    });

    test(`${file}: registers on a mutable L`, () => {
        const L = leafletStub();
        loadWithLeaflet(file, L);

        assert.equal(typeof L.distortableVideoOverlay, 'function');
        assert.equal(typeof L.DistortableVideoOverlay, 'function');
    });

    // The 1.0.0 crash: TypeError: Cannot add property DistortableVideoOverlay,
    // object is not extensible.
    test(`${file}: does not throw when L is frozen, and still exports`, () => {
        const L = Object.freeze(leafletStub());

        let m;
        assert.doesNotThrow(() => { m = loadWithLeaflet(file, L); });
        assert.equal(typeof m.distortableVideoOverlay, 'function',
            'named exports must still work when the L registration is skipped');
        assert.equal(L.distortableVideoOverlay, undefined, 'must not have been added to a frozen L');
    });

    test(`${file}: binds resize so a hidden container can recover`, () => {
        const L = leafletStub();
        const m = loadWithLeaflet(file, L);
        const events = m.DistortableVideoOverlay.prototype.getEvents.call({});

        // Without this the first _reset on a 0x0 viewport is never retried and
        // the video is left with no transform at all.
        assert.ok('resize' in events, 'getEvents must include resize');
    });
}

test('package.json points at files that exist and ship', () => {
    const pkg = require(join(root, 'package.json'));

    assert.ok(require.resolve(join(root, pkg.main)), 'main');
    assert.ok(require.resolve(join(root, pkg.types)), 'types');
    assert.equal(pkg.dependencies, undefined, 'no runtime dependencies');
    assert.ok(pkg.peerDependencies.leaflet.includes('1'), 'leaflet 1 in peer range');
    assert.ok(pkg.peerDependencies.leaflet.includes('2'), 'leaflet 2 in peer range');
});
