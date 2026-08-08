import * as L from 'leaflet';

export interface GeographicalCorners {
    topLeft: L.LatLng;
    topRight: L.LatLng;
    bottomRight: L.LatLng;
    bottomLeft: L.LatLng;
}

/** Four corners clockwise from top-left. */
export type ClockwiseCorners = [L.LatLng, L.LatLng, L.LatLng, L.LatLng];

type Video = string | string[] | HTMLVideoElement;
type Bounds = GeographicalCorners | ClockwiseCorners | L.LatLngBoundsExpression;

export class DistortableVideoOverlay extends L.VideoOverlay {
    constructor(video: Video, bounds: Bounds, options?: L.VideoOverlayOptions);
    setBounds(bounds: L.LatLngBoundsExpression): this;
    setCorners(corners: GeographicalCorners | ClockwiseCorners): this;
    /** The four corners as given. getBounds() is their axis-aligned hull. */
    getCorners(): GeographicalCorners;
}

export function distortableVideoOverlay(
    video: Video, bounds: Bounds, options?: L.VideoOverlayOptions
): DistortableVideoOverlay;

export default distortableVideoOverlay;

// Also registered on L for <script> tag usage, but not when Leaflet resolves as
// an ES module - prefer the exports above under a bundler.
declare module 'leaflet' {
    function distortableVideoOverlay(
        video: Video, bounds: Bounds, options?: L.VideoOverlayOptions
    ): DistortableVideoOverlay;
}
