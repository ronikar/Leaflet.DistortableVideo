import * as L from 'leaflet';

export interface GeographicalCorners {
    topLeft: L.LatLng;
    topRight: L.LatLng;
    bottomRight: L.LatLng;
    bottomLeft: L.LatLng;
}

/** Four corners clockwise from top-left. */
export type ClockwiseCorners = [L.LatLng, L.LatLng, L.LatLng, L.LatLng];

// Deliberately not named Video/Bounds: these are referenced from inside the
// `declare module 'leaflet'` block below, where Leaflet's own exports win the
// name lookup. `Bounds` there resolved to L.Bounds - pixel bounds - so the
// augmentation demanded the wrong type and rejected every correct call.
export type VideoSource = string | string[] | HTMLVideoElement;
export type VideoBounds = GeographicalCorners | ClockwiseCorners | L.LatLngBoundsExpression;

export class DistortableVideoOverlay extends L.VideoOverlay {
    constructor(video: VideoSource, bounds: VideoBounds, options?: L.VideoOverlayOptions);
    setBounds(bounds: L.LatLngBoundsExpression): this;
    setCorners(corners: GeographicalCorners | ClockwiseCorners): this;
    /** The four corners as given. getBounds() is their axis-aligned hull. */
    getCorners(): GeographicalCorners;
}

export function distortableVideoOverlay(
    video: VideoSource, bounds: VideoBounds, options?: L.VideoOverlayOptions
): DistortableVideoOverlay;

export default distortableVideoOverlay;

// Also registered on L for <script> tag usage, but not when Leaflet resolves as
// an ES module - prefer the exports above under a bundler.
declare module 'leaflet' {
    function distortableVideoOverlay(
        video: VideoSource, bounds: VideoBounds, options?: L.VideoOverlayOptions
    ): DistortableVideoOverlay;
}
