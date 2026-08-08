(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
    typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["leaflet-distortable-video"] = {}, global.L));
})(this, (function (exports, L) { 'use strict';

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
    //
    // Returns null when the target has no projective transform, so callers can fall
    // back rather than serialise a matrix the browser will throw away.
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

            // Zero exactly when topRight, bottomRight and bottomLeft are collinear:
            // the quad has collapsed onto a line and no projective map exists. Left
            // undivided this yields Infinity or NaN, which the browser rejects as a
            // whole - dropping the transform and painting the video at viewport size
            // in the top-left corner. Rounding to integer pixels makes a thin quad
            // reach this exactly, so it is reachable by zooming out, not just by
            // passing degenerate corners.
            if (!denominator) return null;

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

    // Applies a transform to an element. Only the -webkit- prefix is still worth
    // carrying, for older WebKit; -khtml-, -moz-, -ms- and -o- never shipped a
    // matrix3d implementation that unprefixed CSS does not already cover.
    function setTransform(element, value) {
        element.style.webkitTransform = value;
        element.style.transform = value;
    }

    // transform-origin is constant for the lifetime of the layer, so it is set once
    // rather than rewritten on every projection.
    function setTransformOrigin(element, value) {
        element.style.webkitTransformOrigin = value;
        element.style.transformOrigin = value;
    }

    function projectiveMatrixToCssValue(matrix) {
        const matrixValues = [];

        // matrix3d() takes its arguments in column-major order.
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++)
                matrixValues.push(matrix[j][i]);
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
            this._setCorners(bounds);
            L.Util.setOptions(this, options);
        },

        setBounds: function (bounds) {
            return this.setCorners(this._boundsToCorners(bounds));
        },

        setCorners: function (corners) {
            this._setCorners(corners);

            if (this._map) {
                this._reset();
            }
            return this;
        },

        // The four corners as given. getBounds() is the axis-aligned hull, which
        // cannot describe a rotated or distorted quad, so this is the accessor that
        // round-trips with setCorners().
        getCorners: function () {
            return this._corners;
        },

        // The inherited event map has no resize, so a map that starts hidden or
        // zero-sized never recomputes and the video keeps no transform at all.
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
            const target = _getTargetCorners(this._corners, pixelicPositionProvider);

            // areSomeCornersEqual only catches coincident corners. A quad can also
            // collapse with all four distinct - three of them collinear - which the
            // projective solver reports by returning null.
            const projective = areSomeCornersEqual(target)
                ? null
                : this._projectWithProjectiveMatrix(origin, target);

            setTransform(this._image, projective || this._projectAsRectangle(origin, target));
        },

        _projectWithProjectiveMatrix: function (origin, target) {
            const matrix3d = findProjectiveMatrix(origin, target);
            if (!matrix3d) return null;

            return projectiveMatrixToCssValue(matrix3d);
        },

        // The quad has collapsed - corners coincide, or three of them are collinear -
        // so the projective system is singular. Fall back to a plain scale/translate
        // onto the target's bounding box.
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

        // _corners drives the projection. _bounds is their axis-aligned hull and has
        // to be a real LatLngBounds: everything inherited reads it and calls
        // LatLngBounds methods on it - getBounds(), getCenter(), popup placement,
        // map.fitBounds(layer.getBounds()) - all of which threw while this held a
        // plain corners object.
        _setCorners: function (value) {
            const corners = this._getCorners(value);

            this._corners = corners;
            this._bounds = new L.LatLngBounds([
                corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft
            ]);
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

    function distortableVideoOverlay(url, corners, options) {
        return new DistortableVideoOverlay(url, corners, options);
    }

    // Kept for <script> tag usage. Guarded because Node's require(ESM) hands over a
    // frozen namespace, where the bare assignment threw.
    if (L && Object.isExtensible(L)) {
        L.DistortableVideoOverlay = DistortableVideoOverlay;
        L.distortableVideoOverlay = distortableVideoOverlay;
    }

    exports.DistortableVideoOverlay = DistortableVideoOverlay;
    exports.default = distortableVideoOverlay;
    exports.distortableVideoOverlay = distortableVideoOverlay;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
