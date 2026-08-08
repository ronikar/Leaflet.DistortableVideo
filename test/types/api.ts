// Type-level tests for the declarations shipped in package.json's `types`.
//
// Nothing here runs - `tsc --noEmit` is the assertion. It compiles only if the
// public API is described correctly, and the @ts-expect-error lines fail the
// build if a call that should be rejected starts being accepted, which is what
// stops the declarations from quietly widening to `any`.
//
// The declarations drifted unnoticed before: they described only the Leaflet
// augmentation and not the package's own exports, and carried a misspelled
// ClosewiseCorners for two releases.

import * as L from 'leaflet';
import defaultExport, {
    DistortableVideoOverlay,
    distortableVideoOverlay,
    GeographicalCorners,
    ClockwiseCorners,
} from 'leaflet-distortable-video';

const corners: GeographicalCorners = {
    topLeft: L.latLng(30.6, -129),
    topRight: L.latLng(32, -100),
    bottomRight: L.latLng(13, -97),
    bottomLeft: L.latLng(13, -130),
};

const clockwise: ClockwiseCorners = [
    L.latLng(30.6, -129), L.latLng(32, -100), L.latLng(13, -97), L.latLng(13, -130),
];

// --- every documented way to construct one -----------------------------------

const fromCorners: DistortableVideoOverlay = distortableVideoOverlay('a.mp4', corners);
const fromClockwise: DistortableVideoOverlay = distortableVideoOverlay('a.mp4', clockwise);
const fromBounds: DistortableVideoOverlay = distortableVideoOverlay('a.mp4', [[32, -130], [13, -100]]);
const fromLatLngBounds: DistortableVideoOverlay = distortableVideoOverlay(
    'a.mp4', L.latLngBounds([32, -130], [13, -100]));

const withOptions = distortableVideoOverlay('a.mp4', corners, { autoplay: true, muted: true, opacity: 0.8 });
const fromArrayOfSources = distortableVideoOverlay(['a.mp4', 'a.webm'], corners);
const fromElement = distortableVideoOverlay(document.createElement('video'), corners);

const constructed = new DistortableVideoOverlay('a.mp4', corners);
const viaDefault = defaultExport('a.mp4', corners);

// --- the package's own methods -----------------------------------------------

const chainedCorners: DistortableVideoOverlay = fromCorners.setCorners(corners);
const chainedClockwise: DistortableVideoOverlay = fromCorners.setCorners(clockwise);
const chainedBounds: DistortableVideoOverlay = fromCorners.setBounds([[32, -130], [13, -100]]);

// New in 1.1.0. Must come back as corners, not as a LatLngBounds.
const gotCorners: GeographicalCorners = fromCorners.getCorners();
const cornerLat: number = gotCorners.topLeft.lat;

// --- the inherited surface that 1.1.0 fixed ----------------------------------
// These all threw at runtime while _bounds held a plain corners object, so the
// types claiming they work is only honest as of 1.1.0.

const bounds: L.LatLngBounds = fromCorners.getBounds();
const centre: L.LatLng = bounds.getCenter();
const contains: boolean = bounds.contains(L.latLng(20, -115));
const added: DistortableVideoOverlay = fromCorners.addTo(new L.Map(document.createElement('div')));
const popped: DistortableVideoOverlay = fromCorners.bindPopup('hello');

// --- registration on L, for <script> tag users -------------------------------

const viaL: DistortableVideoOverlay = L.distortableVideoOverlay('a.mp4', corners);

// The class is registered alongside the factory, and the README documents it.
// It was missing from the augmentation, so this was a TS2339.
const viaLClass: DistortableVideoOverlay = new L.DistortableVideoOverlay('a.mp4', corners);

// --- calls that must stay rejected -------------------------------------------
// If any of these stops erroring the declarations have gone slack, and tsc fails
// the build on the unused directive.

// @ts-expect-error - bounds are required
distortableVideoOverlay('a.mp4');

// @ts-expect-error - a corners object needs all four corners
distortableVideoOverlay('a.mp4', { topLeft: L.latLng(1, 2), topRight: L.latLng(1, 2) });

// @ts-expect-error - corners must be LatLngs, not raw numbers
distortableVideoOverlay('a.mp4', { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4 });

// @ts-expect-error - ClockwiseCorners is exactly four
const tooFew: ClockwiseCorners = [L.latLng(1, 2), L.latLng(1, 2), L.latLng(1, 2)];

// @ts-expect-error - getCorners takes no arguments
fromCorners.getCorners('nope');

// @ts-expect-error - not a real option
distortableVideoOverlay('a.mp4', corners, { notAnOption: true });
