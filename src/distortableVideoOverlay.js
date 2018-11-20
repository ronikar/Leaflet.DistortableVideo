import numeric from "numeric";
import L from "leaflet";
import $ from "jquery";

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

    _animateZoom: function (e) {
        const { zoom, center } = e;
        const origin = _getElementCorners(this.image);
        const pixelicPositionProvider = (point) => {
            const { x, y } = this._map._latLngToNewLayerPoint(point, zoom, center);
            return { x: Math.round(x), y: Math.round(y) }
        };

        this._projectVideoOnMap(origin, pixelicPositionProvider);
    },

    _projectVideoOnMap: function (origin, pixelicPositionProvider) {
        const corners = this._bounds;
        const videoElement = $(this._image);
        const target = _getTargetCorners(corners, pixelicPositionProvider);

        const cssTransformValue = _areSomeCornersEqual(target) ? this._projectAsRectangle(target) :
            this._projectWithProjectiveMatrix(origin, target);

        videoElement.css(_getCssWithPrefixes("transform", cssTransformValue));
        videoElement.css(_getCssWithPrefixes("transform-origin", '0 0 0px'));
    },

    _projectWithProjectiveMatrix: function (origin, target) {
        const matrix3d = _findProjectiveMatrix(origin, target);
        return _projectiveMatrixToCssValue(matrix3d);
    },

    _projectAsRectangle: function (target) {
        const videoElement = $(this._image);
        const xCoordinates = _getXCoordinates(target);
        const yCoordinates = _getYCoordinates(target);

        const minX = Math.min(...xCoordinates);
        const maxX = Math.max(...xCoordinates);
        const minY = Math.min(...yCoordinates);
        const maxY = Math.max(...yCoordinates);

        const size = {
            x: maxX - minX,
            y: maxY - minY
        };

        const scale = `scale3d(${size.x / videoElement.width()}, ${size.y / videoElement.height()}, 1)`;
        const translate = `translate3d(${minX}px, ${minY}px, 0px)`;

        return `${translate} ${scale}`;
    },

    _reset: function () {
        const image = this._image;
        const map = this._map.getContainer();

        $(image).css(_getCssWithPrefixes("transition", "width 0.05s"));
        image.style.width = $(map).width() + 'px';
        image.style.height = $(map).height() + 'px';

        const originAfterReset = _getElementCorners(map);
        const pixelicPositionProvider = (point) => {
            const { x, y } = this._map.latLngToLayerPoint(point);
            return { x: Math.round(x), y: Math.round(y) }
        };

        this._projectVideoOnMap(originAfterReset, pixelicPositionProvider);
    },

    _initImage: function () {
        L.VideoOverlay.prototype._initImage.call(this);
        this._image.style['objectFit'] = 'fill';
    },

    _getCorners: function (value) {
        if (this._isCorners(value)) return value;
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

    _isCorners: function (value) {
        const { topLeft, topRight, bottomLeft, bottomRight } = value;

        return !!topLeft && !!topRight && !!bottomLeft && !!bottomRight;
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

function _getElementCorners(element) {
    const jElement = $(element);
    return _calculateRectangleCorners({ x: 0, y: 0 }, jElement.height(), jElement.width());
}

function _calculateRectangleCorners(topLeft, height, width) {
    const { x: left, y: top } = topLeft;
    const right = left + width;
    const bottom = top + height;

    const topRight = { x: right, y: top };
    const bottomRight = { x: right, y: bottom };
    const bottomLeft = { x: left, y: bottom };

    return { topLeft, topRight, bottomRight, bottomLeft };
}

function _areSomeCornersEqual(corners) {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;

    if (_areCornersEqual(topLeft, topRight)) return true;

    const arr = [topLeft, topRight];
    if (arr.some(corner => _areCornersEqual(corner, bottomRight))) return true;

    arr.push(bottomRight);

    return arr.some(corner => _areCornersEqual(corner, bottomLeft));
}

function _areCornersEqual(corner, otherCorner) {
    return corner.x === otherCorner.x && corner.y === otherCorner.y;
}

function _getXCoordinates(corners) {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;
    return [topLeft.x, topRight.x, bottomRight.x, bottomLeft.x];
}

function _getYCoordinates(corners) {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;
    return [topLeft.y, topRight.y, bottomRight.y, bottomLeft.y];
}

function _findProjectiveMatrix(origin, target) {
    let matrix = [];
    let b = [];

    _addCondition(matrix, b, origin.topLeft, target.topLeft);
    _addCondition(matrix, b, origin.topRight, target.topRight);
    _addCondition(matrix, b, origin.bottomLeft, target.bottomLeft);
    _addCondition(matrix, b, origin.bottomRight, target.bottomRight);

    const x = numeric.solve(matrix, b);

    return [[x[0], x[1], 0, x[2]],
    [x[3], x[4], 0, x[5]],
    [0, 0, 1, 0],
    [x[6], x[7], 0, 1]];
}

function _addCondition(matrix, b, origin, target) {
    const { x, y } = origin;
    const firstCondition = [x, y, 1, 0, 0, 0, -target.x * x, -target.x * y];
    const secondCondition = [0, 0, 0, x, y, 1, -target.y * x, -target.y * y];
    matrix.push(firstCondition);
    b.push(target.x);

    matrix.push(secondCondition);
    b.push(target.y);
}

function _projectiveMatrixToCssValue(matrix) {
    const matrixValues = [];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++)
            matrixValues.push(matrix[j][i].toFixed(20));
    }

    return `matrix3d(${matrixValues.join(',')})`;
}

function _getCssWithPrefixes(key, value) {
    return {
        ["-webkit-" + key]: value,
        ["-khtml-" + key]: value,
        ["-moz-" + key]: value,
        ["-ms-" + key]: value,
        ["-o-" + key]: value,
        [key]: value
    };
}

export default function distortableVideoOverlay(url, corners, options) {
    return new DistortableVideoOverlay(url, corners, options);
}

L.DistortableVideoOverlay = DistortableVideoOverlay;
L.distortableVideoOverlay = distortableVideoOverlay; 
