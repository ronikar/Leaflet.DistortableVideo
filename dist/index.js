(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("leaflet"));
	else if(typeof define === 'function' && define.amd)
		define(["leaflet"], factory);
	else if(typeof exports === 'object')
		exports["leaflet-distortable-video"] = factory(require("leaflet"));
	else
		root["leaflet-distortable-video"] = factory(root["L"]);
})(typeof self !== 'undefined' ? self : this, (__WEBPACK_EXTERNAL_MODULE_leaflet__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utility/corners.js":
/*!********************************!*\
  !*** ./src/utility/corners.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   areCornersEqual: () => (/* binding */ areCornersEqual),
/* harmony export */   areSomeCornersEqual: () => (/* binding */ areSomeCornersEqual),
/* harmony export */   calculateRectangleCorners: () => (/* binding */ calculateRectangleCorners),
/* harmony export */   getXCoordinates: () => (/* binding */ getXCoordinates),
/* harmony export */   getYCoordinates: () => (/* binding */ getYCoordinates),
/* harmony export */   isCorners: () => (/* binding */ isCorners)
/* harmony export */ });
function isCorners(value) {
  var topLeft = value.topLeft,
    topRight = value.topRight,
    bottomLeft = value.bottomLeft,
    bottomRight = value.bottomRight;
  return !!topLeft && !!topRight && !!bottomLeft && !!bottomRight;
}
function calculateRectangleCorners(topLeft, height, width) {
  var left = topLeft.x,
    top = topLeft.y;
  var right = left + width;
  var bottom = top + height;
  var topRight = {
    x: right,
    y: top
  };
  var bottomRight = {
    x: right,
    y: bottom
  };
  var bottomLeft = {
    x: left,
    y: bottom
  };
  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomRight: bottomRight,
    bottomLeft: bottomLeft
  };
}
function areSomeCornersEqual(corners) {
  var topLeft = corners.topLeft,
    topRight = corners.topRight,
    bottomRight = corners.bottomRight,
    bottomLeft = corners.bottomLeft;
  if (areCornersEqual(topLeft, topRight)) return true;
  var arr = [topLeft, topRight];
  if (arr.some(function (corner) {
    return areCornersEqual(corner, bottomRight);
  })) return true;
  arr.push(bottomRight);
  return arr.some(function (corner) {
    return areCornersEqual(corner, bottomLeft);
  });
}
function areCornersEqual(corner, otherCorner) {
  return corner.x === otherCorner.x && corner.y === otherCorner.y;
}
function getXCoordinates(corners) {
  var topLeft = corners.topLeft,
    topRight = corners.topRight,
    bottomRight = corners.bottomRight,
    bottomLeft = corners.bottomLeft;
  return [topLeft.x, topRight.x, bottomRight.x, bottomLeft.x];
}
function getYCoordinates(corners) {
  var topLeft = corners.topLeft,
    topRight = corners.topRight,
    bottomRight = corners.bottomRight,
    bottomLeft = corners.bottomLeft;
  return [topLeft.y, topRight.y, bottomRight.y, bottomLeft.y];
}

/***/ }),

/***/ "./src/utility/css.js":
/*!****************************!*\
  !*** ./src/utility/css.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getScale3dCssValue: () => (/* binding */ getScale3dCssValue),
/* harmony export */   getTranslate3dCssValue: () => (/* binding */ getTranslate3dCssValue),
/* harmony export */   projectiveMatrixToCssValue: () => (/* binding */ projectiveMatrixToCssValue),
/* harmony export */   setTransform: () => (/* binding */ setTransform),
/* harmony export */   setTransformOrigin: () => (/* binding */ setTransformOrigin)
/* harmony export */ });
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
  var matrixValues = [];

  // matrix3d() takes its arguments in column-major order.
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) matrixValues.push(matrix[j][i]);
  }
  return "matrix3d(".concat(matrixValues.join(','), ")");
}
function getScale3dCssValue(origin, target) {
  return "scale3d(".concat(target.width / origin.width, ", ").concat(target.height / origin.height, ", 1)");
}
function getTranslate3dCssValue(tx, ty) {
  var tz = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return "translate3d(".concat(tx, "px, ").concat(ty, "px, ").concat(tz, "px)");
}

/***/ }),

/***/ "./src/utility/projections.js":
/*!************************************!*\
  !*** ./src/utility/projections.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findProjectiveMatrix: () => (/* binding */ findProjectiveMatrix)
/* harmony export */ });
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
  var width = origin.bottomRight.x - origin.topLeft.x;
  var height = origin.bottomRight.y - origin.topLeft.y;
  var _target$topLeft = target.topLeft,
    x0 = _target$topLeft.x,
    y0 = _target$topLeft.y;
  var _target$topRight = target.topRight,
    x1 = _target$topRight.x,
    y1 = _target$topRight.y;
  var _target$bottomRight = target.bottomRight,
    x2 = _target$bottomRight.x,
    y2 = _target$bottomRight.y;
  var _target$bottomLeft = target.bottomLeft,
    x3 = _target$bottomLeft.x,
    y3 = _target$bottomLeft.y;

  // Both are zero exactly when the target is a parallelogram, i.e. when the
  // mapping is affine and needs no perspective term. A rotated map produces
  // this case, so it is the common path, not an edge case.
  var sumX = x0 - x1 + x2 - x3;
  var sumY = y0 - y1 + y2 - y3;
  var a11, a21, a12, a22, a13, a23;
  if (sumX === 0 && sumY === 0) {
    a11 = x1 - x0;
    a21 = x3 - x0;
    a13 = 0;
    a12 = y1 - y0;
    a22 = y3 - y0;
    a23 = 0;
  } else {
    var dx1 = x1 - x2,
      dy1 = y1 - y2;
    var dx2 = x3 - x2,
      dy2 = y3 - y2;
    var denominator = dx1 * dy2 - dx2 * dy1;
    a13 = (sumX * dy2 - dx2 * sumY) / denominator;
    a23 = (dx1 * sumY - sumX * dy1) / denominator;
    a11 = x1 - x0 + a13 * x1;
    a21 = x3 - x0 + a23 * x3;
    a12 = y1 - y0 + a13 * y1;
    a22 = y3 - y0 + a23 * y3;
  }
  return [[a11 / width, a21 / height, 0, x0], [a12 / width, a22 / height, 0, y0], [0, 0, 1, 0], [a13 / width, a23 / height, 0, 1]];
}

/***/ }),

/***/ "leaflet":
/*!****************************************************************************************!*\
  !*** external {"commonjs":"leaflet","commonjs2":"leaflet","amd":"leaflet","root":"L"} ***!
  \****************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_leaflet__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!****************************************!*\
  !*** ./src/distortableVideoOverlay.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ distortableVideoOverlay)
/* harmony export */ });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! leaflet */ "leaflet");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utility_projections__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utility/projections */ "./src/utility/projections.js");
/* harmony import */ var _utility_corners__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utility/corners */ "./src/utility/corners.js");
/* harmony import */ var _utility_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utility/css */ "./src/utility/css.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }




var DistortableVideoOverlay = leaflet__WEBPACK_IMPORTED_MODULE_0___default().VideoOverlay.extend({
  initialize: function initialize(element, bounds, options) {
    this._url = element;
    this._bounds = this._getCorners(bounds);
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().Util.setOptions(this, options);
  },
  setBounds: function setBounds(bounds) {
    return this.setCorners(this._boundsToCorners(bounds));
  },
  setCorners: function setCorners(corners) {
    this._bounds = this._getCorners(corners);
    if (this._map) {
      this._reset();
    }
    return this;
  },
  _initImage: function _initImage() {
    leaflet__WEBPACK_IMPORTED_MODULE_0___default().VideoOverlay.prototype._initImage.call(this);
    this._image.style.objectFit = 'fill';

    // Constant for the lifetime of the layer, so it is set once here rather
    // than rewritten on every projection.
    (0,_utility_css__WEBPACK_IMPORTED_MODULE_3__.setTransformOrigin)(this._image, '0 0 0');
  },
  // The video is always sized to the map viewport, so the projection's source
  // rectangle is the viewport rectangle anchored at (0,0). map.getSize() is
  // cached by Leaflet, so reading it does not force a layout the way measuring
  // the container did.
  _originRect: function _originRect() {
    var size = this._map.getSize();

    // A hidden or zero-sized container gives a degenerate source rectangle,
    // which makes the projective system singular and every matrix entry NaN.
    // Keep the last good transform instead of writing a value the browser
    // discards and nothing ever recomputes.
    if (!size.x || !size.y) return null;
    return (0,_utility_corners__WEBPACK_IMPORTED_MODULE_2__.calculateRectangleCorners)({
      x: 0,
      y: 0
    }, size.y, size.x);
  },
  _reset: function _reset() {
    var _this = this;
    var origin = this._originRect();
    if (!origin) return;
    var size = this._map.getSize();
    this._image.style.width = size.x + 'px';
    this._image.style.height = size.y + 'px';
    this._projectVideoOnMap(origin, function (point) {
      var _this$_map$latLngToLa = _this._map.latLngToLayerPoint(point),
        x = _this$_map$latLngToLa.x,
        y = _this$_map$latLngToLa.y;
      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    });
  },
  _animateZoom: function _animateZoom(e) {
    var _this2 = this;
    var zoom = e.zoom,
      center = e.center;
    var origin = this._originRect();
    if (!origin) return;
    this._projectVideoOnMap(origin, function (point) {
      var _this2$_map$_latLngTo = _this2._map._latLngToNewLayerPoint(point, zoom, center),
        x = _this2$_map$_latLngTo.x,
        y = _this2$_map$_latLngTo.y;
      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    });
  },
  _projectVideoOnMap: function _projectVideoOnMap(origin, pixelicPositionProvider) {
    var target = _getTargetCorners(this._bounds, pixelicPositionProvider);
    var cssTransformValue = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_2__.areSomeCornersEqual)(target) ? this._projectAsRectangle(origin, target) : this._projectWithProjectiveMatrix(origin, target);
    (0,_utility_css__WEBPACK_IMPORTED_MODULE_3__.setTransform)(this._image, cssTransformValue);
  },
  _projectWithProjectiveMatrix: function _projectWithProjectiveMatrix(origin, target) {
    var matrix3d = (0,_utility_projections__WEBPACK_IMPORTED_MODULE_1__.findProjectiveMatrix)(origin, target);
    return (0,_utility_css__WEBPACK_IMPORTED_MODULE_3__.projectiveMatrixToCssValue)(matrix3d);
  },
  // Two or more target corners coincide, so the quad has collapsed and the
  // projective system would be singular. Fall back to a plain scale/translate.
  _projectAsRectangle: function _projectAsRectangle(origin, target) {
    var xCoordinates = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_2__.getXCoordinates)(target);
    var yCoordinates = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_2__.getYCoordinates)(target);
    var minX = Math.min.apply(Math, _toConsumableArray(xCoordinates));
    var maxX = Math.max.apply(Math, _toConsumableArray(xCoordinates));
    var minY = Math.min.apply(Math, _toConsumableArray(yCoordinates));
    var maxY = Math.max.apply(Math, _toConsumableArray(yCoordinates));
    var size = {
      width: origin.bottomRight.x,
      height: origin.bottomRight.y
    };
    var afterScalingSize = {
      width: maxX - minX,
      height: maxY - minY
    };
    return "".concat((0,_utility_css__WEBPACK_IMPORTED_MODULE_3__.getTranslate3dCssValue)(minX, minY), " ").concat((0,_utility_css__WEBPACK_IMPORTED_MODULE_3__.getScale3dCssValue)(size, afterScalingSize));
  },
  _getCorners: function _getCorners(value) {
    if ((0,_utility_corners__WEBPACK_IMPORTED_MODULE_2__.isCorners)(value)) return value;
    if (this._isPointArray(value)) return this._pointArrayToCorners(value);
    return this._boundsToCorners(value);
  },
  _boundsToCorners: function _boundsToCorners(bounds) {
    bounds = leaflet__WEBPACK_IMPORTED_MODULE_0___default().latLngBounds(bounds);
    return {
      topLeft: bounds.getNorthWest(),
      topRight: bounds.getNorthEast(),
      bottomLeft: bounds.getSouthWest(),
      bottomRight: bounds.getSouthEast()
    };
  },
  _pointArrayToCorners: function _pointArrayToCorners(points) {
    var _points = _slicedToArray(points, 4),
      topLeft = _points[0],
      topRight = _points[1],
      bottomRight = _points[2],
      bottomLeft = _points[3];
    return {
      topLeft: topLeft,
      topRight: topRight,
      bottomRight: bottomRight,
      bottomLeft: bottomLeft
    };
  },
  _isPointArray: function _isPointArray(value) {
    if (!Array.isArray(value)) return false;
    var _value = _slicedToArray(value, 4),
      topLeft = _value[0],
      topRight = _value[1],
      bottomRight = _value[2],
      bottomLeft = _value[3];
    return !!topLeft && !!topRight && !!bottomRight && !!bottomLeft;
  }
});
function _getTargetCorners(geographicCorners, pixelicPositionProvider) {
  var topLeft = geographicCorners.topLeft,
    topRight = geographicCorners.topRight,
    bottomLeft = geographicCorners.bottomLeft,
    bottomRight = geographicCorners.bottomRight;
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
(leaflet__WEBPACK_IMPORTED_MODULE_0___default().DistortableVideoOverlay) = DistortableVideoOverlay;
(leaflet__WEBPACK_IMPORTED_MODULE_0___default().distortableVideoOverlay) = distortableVideoOverlay;
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=index.js.map