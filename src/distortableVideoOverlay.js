import L from "leaflet";
import $ from "jquery";

import { findProjectiveMatrix } from "./utility/projections";
import { isCorners, getElementCorners, getXCoordinates, getYCoordinates, areSomeCornersEqual } from "./utility/corners";
import { getCssWithPrefixes, projectiveMatrixToCssValue, getScale3dCssValue, getTranslate3dCssValue } from "./utility/css";

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

    _initImage: function () {
        L.VideoOverlay.prototype._initImage.call(this);
        this._image.style['objectFit'] = 'fill';
    },

    _reset: function () {
        const image = this._image;
        const map = this._map.getContainer();

        $(image).css(getCssWithPrefixes("transition", "width 0.05s"));
        image.style.width = $(map).width() + 'px';
        image.style.height = $(map).height() + 'px';

        const originAfterReset = getElementCorners(map);
        const pixelicPositionProvider = (point) => {
            const { x, y } = this._map.latLngToLayerPoint(point);
            return { x: Math.round(x), y: Math.round(y) }
        };

        this._projectVideoOnMap(originAfterReset, pixelicPositionProvider);
    },

    _animateZoom: function (e) {
        const { zoom, center } = e;
        const videoPosition = getElementCorners(this.image);
        const pixelicPositionProvider = (point) => {
            const { x, y } = this._map._latLngToNewLayerPoint(point, zoom, center);
            return { x: Math.round(x), y: Math.round(y) }
        };

        this._projectVideoOnMap(videoPosition, pixelicPositionProvider);
    },

    _projectVideoOnMap: function (origin, pixelicPositionProvider) {
        const corners = this._bounds;
        const videoElement = $(this._image);
        const target = _getTargetCorners(corners, pixelicPositionProvider);

        const cssTransformValue = areSomeCornersEqual(target) ? this._projectAsRectangle(target) :
            this._projectWithProjectiveMatrix(origin, target);

        videoElement.css(getCssWithPrefixes("transform", cssTransformValue));
        videoElement.css(getCssWithPrefixes("transform-origin", '0 0 0px'));
    },

    _projectWithProjectiveMatrix: function (origin, target) {
        const matrix3d = findProjectiveMatrix(origin, target);
        return projectiveMatrixToCssValue(matrix3d);
    },

    _projectAsRectangle: function (target) {
        const videoElement = $(this._image);
        const xCoordinates = getXCoordinates(target);
        const yCoordinates = getYCoordinates(target);

        const minX = Math.min(...xCoordinates);
        const maxX = Math.max(...xCoordinates);
        const minY = Math.min(...yCoordinates);
        const maxY = Math.max(...yCoordinates);

        const size = { height: videoElement.height(), width: videoElement.width() };
        const afterScalingSize = { height: maxY - minY, width: maxX - minX };

        return `${getTranslate3dCssValue(minX, minY)} ${getScale3dCssValue(size, afterScalingSize)}`;
    },

    _getCorners: function (value) {
        if (isCorners(value)) return value;
        if (this._isPointArray(value)) return this._pointArrayToCorners(value);
        return this._boundsToCorners(value);
    },

    _boundsToCorners: function (bounds) {
        bounds = L.latLngBounds(bounds);

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
    }
};

export default function distortableVideoOverlay(url, corners, options) {
    return new DistortableVideoOverlay(url, corners, options);
}

L.DistortableVideoOverlay = DistortableVideoOverlay;
L.distortableVideoOverlay = distortableVideoOverlay;