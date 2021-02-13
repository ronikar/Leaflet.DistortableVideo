import * as L from 'leaflet';

declare module "leaflet" {
    interface GeographicalCorners {
        topLeft: L.LatLng,
        topRight: L.LatLng,
        bottomRight: L.LatLng,
        bottomLeft: L.LatLng
    }

    type ClosewiseCorners = [L.LatLng, L.LatLng, L.LatLng, L.LatLng];

    class DistortableVideoOverlay extends VideoOverlay {
        constructor(video: string | string[] | HTMLVideoElement, bounds: GeographicalCorners | ClosewiseCorners | LatLngBoundsExpression, options?: VideoOverlayOptions);
        setBounds(bounds: LatLngBoundsExpression): this;
        setCorners(corners: GeographicalCorners | ClosewiseCorners): this;
    }

    function distortableVideoOverlay(video: string | string[] | HTMLVideoElement, bounds: GeographicalCorners | ClosewiseCorners | LatLngBoundsExpression, options?: VideoOverlayOptions): DistortableVideoOverlay;
}