import * as L from 'leaflet';

export interface GeographicalCorners {
    topLeft: L.LatLng;
    topRight: L.LatLng;
    bottomRight: L.LatLng;
    bottomLeft: L.LatLng;
}

/** Four corners clockwise from top-left. */
export type ClockwiseCorners = [L.LatLng, L.LatLng, L.LatLng, L.LatLng];

export type DistortableVideoBounds =
    | GeographicalCorners
    | ClockwiseCorners
    | L.LatLngBoundsExpression;

export type VideoSource = string | string[] | HTMLVideoElement;

export class DistortableVideoOverlay extends L.VideoOverlay {
    constructor(video: VideoSource, bounds: DistortableVideoBounds, options?: L.VideoOverlayOptions);
    setBounds(bounds: L.LatLngBoundsExpression): this;
    setCorners(corners: GeographicalCorners | ClockwiseCorners): this;
}

export function distortableVideoOverlay(
    video: VideoSource,
    bounds: DistortableVideoBounds,
    options?: L.VideoOverlayOptions
): DistortableVideoOverlay;

export default distortableVideoOverlay;

// The plugin also registers itself on the L namespace, which is how the
// <script> tag usage works. That registration is skipped when L is a frozen ES
// module namespace, so under a bundler prefer the exports above.
declare module 'leaflet' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DistortableVideoOverlayStatic {
        new(video: VideoSource, bounds: DistortableVideoBounds, options?: L.VideoOverlayOptions): DistortableVideoOverlay;
    }

    let DistortableVideoOverlay: DistortableVideoOverlayStatic | undefined;

    function distortableVideoOverlay(
        video: VideoSource,
        bounds: DistortableVideoBounds,
        options?: L.VideoOverlayOptions
    ): DistortableVideoOverlay;
}
