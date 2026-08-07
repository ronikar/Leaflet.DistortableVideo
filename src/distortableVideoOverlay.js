import L from "leaflet";

import { findProjectiveMatrix } from "./utility/projections";
import { isCorners, calculateRectangleCorners, getXCoordinates, getYCoordinates, areSomeCornersEqual } from "./utility/corners";
import { setTransform, setTransformOrigin, projectiveMatrixToCssValue, getScale3dCssValue, getTranslate3dCssValue } from "./utility/css";

const DistortableVideoOverlay = L.VideoOverlay.extend({
    initialize: function (element, bounds, options) {
        this._url = element;
        this._bounds = this._getCorners(bounds);
        L.Util.setOptions(this, options);
    },

    setBounds: function (bounds) {
        return this.setCorners(this._boundsToCorners(bounds));
    },

    setCorners: function (corners) {
        this._bounds = this._getCorners(corners);

        if (this._map) {
            this._reset();
        }
        return this;
    },

    // The inherited event map binds only zoom, viewreset and zoomanim. Without
    // resize, a map whose container starts hidden or zero-sized never recovers:
    // the first _reset bails on a 0x0 viewport and nothing ever recomputes, so
    // the video keeps no transform and no size at all. That is the ordinary
    // tab / modal / accordion case, not an exotic one.
    getEvents: function () {
        const events = L.VideoOverlay.prototype.getEvents.call(this);
        events.resize = this._reset;
        return events;
    },

    _initImage: function () {
        L.VideoOverlay.prototype._initImage.call(this);

        this._image.style.objectFit = 'fill';

        // Constant for the lifetime of the layer, so it is set once here rather
        // than rewritten on every projection.
        setTransformOrigin(this._image, '0 0 0');
    },

    // The video is always sized to the map viewport, so the projection's source
    // rectangle is the viewport rectangle anchored at (0,0). map.getSize() is
    // cached by Leaflet, so reading it does not force a layout the way measuring
    // the container did.
    _originRect: function () {
        const size = this._map.getSize();

        // A hidden or zero-sized container gives a degenerate source rectangle,
        // which makes the projective system singular and every matrix entry NaN.
        // Keep the last good transform instead of writing a value the browser
        // discards and nothing ever recomputes.
        if (!size.x || !size.y) return null;

        return calculateRectangleCorners({ x: 0, y: 0 }, size.y, size.x);
    },

    _reset: function () {
        const origin = this._originRect();
        if (!origin) return;

        const size = this._map.getSize();
        this._image.style.width = size.x + 'px';
        this._image.style.height = size.y + 'px';

        this._projectVideoOnMap(origin, (point) => {
            const { x, y } = this._map.latLngToLayerPoint(point);
            return { x: Math.round(x), y: Math.round(y) };
        });
    },

    _animateZoom: function (e) {
        const { zoom, center } = e;
        const origin = this._originRect();
        if (!origin) return;

        this._projectVideoOnMap(origin, (point) => {
            const { x, y } = this._map._latLngToNewLayerPoint(point, zoom, center);
            return { x: Math.round(x), y: Math.round(y) };
        });
    },

    _projectVideoOnMap: function (origin, pixelicPositionProvider) {
        const target = _getTargetCorners(this._bounds, pixelicPositionProvider);

        const cssTransformValue = areSomeCornersEqual(target)
            ? this._projectAsRectangle(origin, target)
            : this._projectWithProjectiveMatrix(origin, target);

        setTransform(this._image, cssTransformValue);
    },

    _projectWithProjectiveMatrix: function (origin, target) {
        const matrix3d = findProjectiveMatrix(origin, target);
        return projectiveMatrixToCssValue(matrix3d);
    },

    // Two or more target corners coincide, so the quad has collapsed and the
    // projective system would be singular. Fall back to a plain scale/translate.
    _projectAsRectangle: function (origin, target) {
        const xCoordinates = getXCoordinates(target);
        const yCoordinates = getYCoordinates(target);

        const minX = Math.min(...xCoordinates);
        const maxX = Math.max(...xCoordinates);
        const minY = Math.min(...yCoordinates);
        const maxY = Math.max(...yCoordinates);

        const size = { width: origin.bottomRight.x, height: origin.bottomRight.y };
        const afterScalingSize = { width: maxX - minX, height: maxY - minY };

        return `${getTranslate3dCssValue(minX, minY)} ${getScale3dCssValue(size, afterScalingSize)}`;
    },

    _getCorners: function (value) {
        if (isCorners(value)) return value;
        if (this._isPointArray(value)) return this._pointArrayToCorners(value);
        return this._boundsToCorners(value);
    },

    _boundsToCorners: function (bounds) {
        // Leaflet 2 removed the lowercase factories, so L.latLngBounds() is gone.
        // Its LatLngBounds constructor accepts everything the factory did except an
        // existing LatLngBounds - and Leaflet 1's constructor rejects that too - so
        // keep the factory's identity shortcut explicitly. This branches on the
        // input rather than on which Leaflet is loaded, and works on both majors.
        bounds = bounds instanceof L.LatLngBounds ? bounds : new L.LatLngBounds(bounds);

        return {
            topLeft: bounds.getNorthWest(),
            topRight: bounds.getNorthEast(),
            bottomLeft: bounds.getSouthWest(),
            bottomRight: bounds.getSouthEast()
        };
    },

    _pointArrayToCorners: function (points) {
        const [topLeft, topRight, bottomRight, bottomLeft] = points;
        return { topLeft, topRight, bottomRight, bottomLeft };
    },

    _isPointArray: function (value) {
        if (!Array.isArray(value)) return false;

        const [topLeft, topRight, bottomRight, bottomLeft] = value;
        return !!topLeft && !!topRight && !!bottomRight && !!bottomLeft;
    }
});

function _getTargetCorners(geographicCorners, pixelicPositionProvider) {
    const { topLeft, topRight, bottomLeft, bottomRight } = geographicCorners;

    return {
        topLeft: pixelicPositionProvider(topLeft),
        topRight: pixelicPositionProvider(topRight),
        bottomLeft: pixelicPositionProvider(bottomLeft),
        bottomRight: pixelicPositionProvider(bottomRight)
    };
}

export default function distortableVideoOverlay(url, corners, options) {
    return new DistortableVideoOverlay(url, corners, options);
}

// Named exports are the reliable way to reach this from a bundler. Patching the
// L namespace below only works when L is a mutable object, which it is for a
// <script> tag and for Leaflet 1 through a bundler, but not when Leaflet is
// resolved as a real ES module - a module namespace is frozen, so the
// assignment either lands on an unreachable interop copy or throws outright.
export { DistortableVideoOverlay, distortableVideoOverlay };

// Registering on L is what the <script> tag usage depends on, so keep it - but
// only where the namespace accepts writes. Node's require(ESM) interop hands
// over the genuine frozen namespace, where this threw a TypeError on import.
if (L && Object.isExtensible(L)) {
    L.DistortableVideoOverlay = DistortableVideoOverlay;
    L.distortableVideoOverlay = distortableVideoOverlay;
}
