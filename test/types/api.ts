// Type-level tests for the declarations shipped in package.json's `types`.
//
// Nothing here runs - `tsc --noEmit` is the assertion. It compiles only if the
// public API is described correctly, and the @ts-expect-error lines fail the
// build if a call that should be rejected starts being accepted, which is what
// stops the declarations from quietly widening.
//
// The declarations drifted unnoticed before: they described only the Leaflet
// augmentation and not the package's own exports, carried a misspelled
// ClosewiseCorners for two releases, and shipped a `Bounds` alias that resolved
// to L.Bounds inside the leaflet augmentation.

import * as L from 'leaflet';
import defaultExport, {
    DistortableVideoOverlay,
    distortableVideoOverlay,
    GeographicalCorners,
    ClockwiseCorners,
    VideoSource,
    VideoBounds,
} from 'leaflet-distortable-video';

// Assignability is too weak to test a declaration: `any` is assignable to
// everything, so `const c: GeographicalCorners = overlay.getCorners()` keeps
// compiling after the declaration rots to `any`. These compare types exactly,
// so a widened return type or parameter fails the build.
type Exact<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
declare function expectType<Expected>(): <Actual>(
    actual: Exact<Actual, Expected> extends true ? Actual : never
) => void;

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

expectType<DistortableVideoOverlay>()(distortableVideoOverlay('a.mp4', corners));
expectType<DistortableVideoOverlay>()(distortableVideoOverlay('a.mp4', clockwise));
expectType<DistortableVideoOverlay>()(distortableVideoOverlay('a.mp4', [[32, -130], [13, -100]]));
expectType<DistortableVideoOverlay>()(
    distortableVideoOverlay('a.mp4', L.latLngBounds([32, -130], [13, -100])));
expectType<DistortableVideoOverlay>()(
    distortableVideoOverlay('a.mp4', corners, { autoplay: true, muted: true, opacity: 0.8 }));
expectType<DistortableVideoOverlay>()(distortableVideoOverlay(['a.mp4', 'a.webm'], corners));
expectType<DistortableVideoOverlay>()(
    distortableVideoOverlay(document.createElement('video'), corners));
expectType<DistortableVideoOverlay>()(new DistortableVideoOverlay('a.mp4', corners));
expectType<DistortableVideoOverlay>()(defaultExport('a.mp4', corners));

// The exported aliases are part of the public surface, so pin their shape too.
expectType<VideoSource>()('a.mp4' as string | string[] | HTMLVideoElement);
expectType<VideoBounds>()(corners as GeographicalCorners | ClockwiseCorners | L.LatLngBoundsExpression);

const overlay = distortableVideoOverlay('a.mp4', corners);

// --- the package's own methods -----------------------------------------------

expectType<DistortableVideoOverlay>()(overlay.setCorners(corners));
expectType<DistortableVideoOverlay>()(overlay.setCorners(clockwise));
expectType<DistortableVideoOverlay>()(overlay.setBounds([[32, -130], [13, -100]]));

// New in 1.1.0. Must come back as corners, not as a LatLngBounds.
expectType<GeographicalCorners>()(overlay.getCorners());
expectType<number>()(overlay.getCorners().topLeft.lat);

// --- the inherited surface that 1.1.0 fixed ----------------------------------
// These all threw at runtime while _bounds held a plain corners object, so the
// types claiming they work is only honest as of 1.1.0.

expectType<L.LatLngBounds>()(overlay.getBounds());
expectType<L.LatLng>()(overlay.getBounds().getCenter());
expectType<boolean>()(overlay.getBounds().contains(L.latLng(20, -115)));
expectType<DistortableVideoOverlay>()(overlay.addTo(new L.Map(document.createElement('div'))));
expectType<DistortableVideoOverlay>()(overlay.bindPopup('hello'));

// --- registration on L, for <script> tag users -------------------------------
// 1.1.0 shipped this broken: inside `declare module 'leaflet'` the local Bounds
// alias resolved to L.Bounds, so a corners object was rejected outright.

expectType<DistortableVideoOverlay>()(L.distortableVideoOverlay('a.mp4', corners));
expectType<DistortableVideoOverlay>()(L.distortableVideoOverlay('a.mp4', clockwise));

// --- calls that must stay rejected -------------------------------------------
// tsc errors on an *unused* @ts-expect-error, so if any of these stops being an
// error the build fails and the slackened declaration is caught.

// @ts-expect-error - bounds are required
distortableVideoOverlay('a.mp4');

// @ts-expect-error - a corners object needs all four corners
distortableVideoOverlay('a.mp4', { topLeft: L.latLng(1, 2), topRight: L.latLng(1, 2) });

// @ts-expect-error - corners must be LatLngs, not raw numbers
distortableVideoOverlay('a.mp4', { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4 });

// @ts-expect-error - ClockwiseCorners is exactly four
distortableVideoOverlay('a.mp4', [L.latLng(1, 2), L.latLng(1, 2), L.latLng(1, 2)]);

// @ts-expect-error - getCorners takes no arguments
overlay.getCorners('nope');

// @ts-expect-error - not a real option
distortableVideoOverlay('a.mp4', corners, { notAnOption: true });

// expectType only pins return types, so the methods need negative tests of their
// own - widening a parameter to `any` leaves the return type untouched and would
// otherwise slip through.

// @ts-expect-error - setCorners needs all four corners
overlay.setCorners({ topLeft: L.latLng(1, 2) });

// @ts-expect-error - setCorners takes corners, not a bounds literal
overlay.setCorners([[32, -130], [13, -100]]);

// @ts-expect-error - setBounds takes bounds, not a corners object
overlay.setBounds(corners);
