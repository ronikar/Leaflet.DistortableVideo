(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet'), require('jquery')) :
    typeof define === 'function' && define.amd ? define(['exports', 'leaflet', 'jquery'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["leaflet-distortable-video"] = {}, global.L, global.jQuery));
})(this, (function (exports, L, $) { 'use strict';

    // Solves for the projective transform that maps `origin` onto `target`, returned
    // as the 4x4 matrix projectiveMatrixToCssValue() serialises into matrix3d().
    //
    // PRECONDITION: `origin` is the axis-aligned rectangle (0,0)-(w,0)-(w,h)-(0,h).
    // Both call sites satisfy this, because they build `origin` with
    // getElementCorners(), which anchors the rectangle at {x: 0, y: 0}.
    //
    // That precondition is what makes the closed form below possible. A general
    // rectangle-to-quadrilateral homography is the classic unit-square-to-quad
    // mapping pre-scaled by 1/w and 1/h, so there is no linear system to solve:
    // one 2x2 determinant replaces the 8x8 Gaussian elimination this used to hand
    // to numeric.solve(). Same result to ~1e-10 px, and no dependency.
    function findProjectiveMatrix(origin, target) {
        const width = origin.bottomRight.x - origin.topLeft.x;
        const height = origin.bottomRight.y - origin.topLeft.y;

        const { x: x0, y: y0 } = target.topLeft;
        const { x: x1, y: y1 } = target.topRight;
        const { x: x2, y: y2 } = target.bottomRight;
        const { x: x3, y: y3 } = target.bottomLeft;

        // Both are zero exactly when the target is a parallelogram, i.e. when the
        // mapping is affine and needs no perspective term. A rotated map produces
        // this case, so it is the common path, not an edge case.
        const sumX = x0 - x1 + x2 - x3;
        const sumY = y0 - y1 + y2 - y3;

        let a11, a21, a12, a22, a13, a23;

        if (sumX === 0 && sumY === 0) {
            a11 = x1 - x0;
            a21 = x3 - x0;
            a13 = 0;

            a12 = y1 - y0;
            a22 = y3 - y0;
            a23 = 0;
        } else {
            const dx1 = x1 - x2, dy1 = y1 - y2;
            const dx2 = x3 - x2, dy2 = y3 - y2;
            const denominator = dx1 * dy2 - dx2 * dy1;

            a13 = (sumX * dy2 - dx2 * sumY) / denominator;
            a23 = (dx1 * sumY - sumX * dy1) / denominator;

            a11 = x1 - x0 + a13 * x1;
            a21 = x3 - x0 + a23 * x3;

            a12 = y1 - y0 + a13 * y1;
            a22 = y3 - y0 + a23 * y3;
        }

        return [[a11 / width, a21 / height, 0, x0],
        [a12 / width, a22 / height, 0, y0],
        [0, 0, 1, 0],
        [a13 / width, a23 / height, 0, 1]];
    }

    function isCorners(value) {
        const { topLeft, topRight, bottomLeft, bottomRight } = value;

        return !!topLeft && !!topRight && !!bottomLeft && !!bottomRight;
    }

    function getElementCorners(element) {
        const jElement = $(element);
        return calculateRectangleCorners({ x: 0, y: 0 }, jElement.height(), jElement.width());
    }

    function calculateRectangleCorners(topLeft, height, width) {
        const { x: left, y: top } = topLeft;
        const right = left + width;
        const bottom = top + height;

        const topRight = { x: right, y: top };
        const bottomRight = { x: right, y: bottom };
        const bottomLeft = { x: left, y: bottom };

        return { topLeft, topRight, bottomRight, bottomLeft };
    }

    function areSomeCornersEqual(corners) {
        const { topLeft, topRight, bottomRight, bottomLeft } = corners;

        if (areCornersEqual(topLeft, topRight)) return true;

        const arr = [topLeft, topRight];
        if (arr.some(corner => areCornersEqual(corner, bottomRight))) return true;

        arr.push(bottomRight);

        return arr.some(corner => areCornersEqual(corner, bottomLeft));
    }

    function areCornersEqual(corner, otherCorner) {
        return corner.x === otherCorner.x && corner.y === otherCorner.y;
    }

    function getXCoordinates(corners) {
        const { topLeft, topRight, bottomRight, bottomLeft } = corners;
        return [topLeft.x, topRight.x, bottomRight.x, bottomLeft.x];
    }

    function getYCoordinates(corners) {
        const { topLeft, topRight, bottomRight, bottomLeft } = corners;
        return [topLeft.y, topRight.y, bottomRight.y, bottomLeft.y];
    }

    function getCssWithPrefixes(key, value) {
        return {
            ["-webkit-" + key]: value,
            ["-khtml-" + key]: value,
            ["-moz-" + key]: value,
            ["-ms-" + key]: value,
            ["-o-" + key]: value,
            [key]: value
        };
    }

    function projectiveMatrixToCssValue(matrix) {
        const matrixValues = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++)
                matrixValues.push(matrix[j][i].toFixed(20));
        }

        return `matrix3d(${matrixValues.join(',')})`;
    }

    function getScale3dCssValue(origin, target) {
        return `scale3d(${target.width / origin.width}, ${target.height / origin.height}, 1)`;
    }

    function getTranslate3dCssValue(tx, ty, tz = 0) {
        return `translate3d(${tx}px, ${ty}px, ${tz}px)`;
    }

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
    }
    function distortableVideoOverlay(url, corners, options) {
        return new DistortableVideoOverlay(url, corners, options);
    }

    L.DistortableVideoOverlay = DistortableVideoOverlay;
    L.distortableVideoOverlay = distortableVideoOverlay;

    exports.default = distortableVideoOverlay;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
