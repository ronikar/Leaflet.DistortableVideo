(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("leaflet"), require("jquery"), require("numeric"));
	else if(typeof define === 'function' && define.amd)
		define(["leaflet", "jquery", "numeric"], factory);
	else if(typeof exports === 'object')
		exports["leaflet-distortable-video"] = factory(require("leaflet"), require("jquery"), require("numeric"));
	else
		root["leaflet-distortable-video"] = factory(root["L"], root["jQuery"], root["numeric"]);
})(self, (__WEBPACK_EXTERNAL_MODULE_leaflet__, __WEBPACK_EXTERNAL_MODULE_jquery__, __WEBPACK_EXTERNAL_MODULE_numeric__) => {
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
/* harmony export */   getElementCorners: () => (/* binding */ getElementCorners),
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
function getElementCorners(element) {
  var jElement = $(element);
  return calculateRectangleCorners({
    x: 0,
    y: 0
  }, jElement.height(), jElement.width());
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
/* harmony export */   getCssWithPrefixes: () => (/* binding */ getCssWithPrefixes),
/* harmony export */   getScale3dCssValue: () => (/* binding */ getScale3dCssValue),
/* harmony export */   getTranslate3dCssValue: () => (/* binding */ getTranslate3dCssValue),
/* harmony export */   projectiveMatrixToCssValue: () => (/* binding */ projectiveMatrixToCssValue)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function getCssWithPrefixes(key, value) {
  var _ref;
  return _ref = {}, _defineProperty(_ref, "-webkit-" + key, value), _defineProperty(_ref, "-khtml-" + key, value), _defineProperty(_ref, "-moz-" + key, value), _defineProperty(_ref, "-ms-" + key, value), _defineProperty(_ref, "-o-" + key, value), _defineProperty(_ref, key, value), _ref;
}
function projectiveMatrixToCssValue(matrix) {
  var matrixValues = [];
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) matrixValues.push(matrix[j][i].toFixed(20));
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
/* harmony import */ var numeric__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! numeric */ "numeric");
/* harmony import */ var numeric__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(numeric__WEBPACK_IMPORTED_MODULE_0__);

function findProjectiveMatrix(origin, target) {
  var matrix = [];
  var b = [];
  _addCondition(matrix, b, origin.topLeft, target.topLeft);
  _addCondition(matrix, b, origin.topRight, target.topRight);
  _addCondition(matrix, b, origin.bottomLeft, target.bottomLeft);
  _addCondition(matrix, b, origin.bottomRight, target.bottomRight);
  var x = numeric__WEBPACK_IMPORTED_MODULE_0___default().solve(matrix, b);
  return [[x[0], x[1], 0, x[2]], [x[3], x[4], 0, x[5]], [0, 0, 1, 0], [x[6], x[7], 0, 1]];
}
function _addCondition(matrix, b, origin, target) {
  var x = origin.x,
    y = origin.y;
  var firstCondition = [x, y, 1, 0, 0, 0, -target.x * x, -target.x * y];
  var secondCondition = [0, 0, 0, x, y, 1, -target.y * x, -target.y * y];
  matrix.push(firstCondition);
  b.push(target.x);
  matrix.push(secondCondition);
  b.push(target.y);
}

/***/ }),

/***/ "numeric":
/*!**************************!*\
  !*** external "numeric" ***!
  \**************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_numeric__;

/***/ }),

/***/ "jquery":
/*!******************************************************************************************!*\
  !*** external {"commonjs":"jquery","commonjs2":"jquery","amd":"jquery","root":"jQuery"} ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_jquery__;

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
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utility_projections__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utility/projections */ "./src/utility/projections.js");
/* harmony import */ var _utility_corners__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utility/corners */ "./src/utility/corners.js");
/* harmony import */ var _utility_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utility/css */ "./src/utility/css.js");
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
    this._image.style['objectFit'] = 'fill';
  },
  _reset: function _reset() {
    var _this = this;
    var image = this._image;
    var map = this._map.getContainer();
    jquery__WEBPACK_IMPORTED_MODULE_1___default()(image).css((0,_utility_css__WEBPACK_IMPORTED_MODULE_4__.getCssWithPrefixes)("transition", "width 0.05s"));
    image.style.width = jquery__WEBPACK_IMPORTED_MODULE_1___default()(map).width() + 'px';
    image.style.height = jquery__WEBPACK_IMPORTED_MODULE_1___default()(map).height() + 'px';
    var originAfterReset = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_3__.getElementCorners)(map);
    var pixelicPositionProvider = function pixelicPositionProvider(point) {
      var _this$_map$latLngToLa = _this._map.latLngToLayerPoint(point),
        x = _this$_map$latLngToLa.x,
        y = _this$_map$latLngToLa.y;
      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    };
    this._projectVideoOnMap(originAfterReset, pixelicPositionProvider);
  },
  _animateZoom: function _animateZoom(e) {
    var _this2 = this;
    var zoom = e.zoom,
      center = e.center;
    var videoPosition = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_3__.getElementCorners)(this.image);
    var pixelicPositionProvider = function pixelicPositionProvider(point) {
      var _this2$_map$_latLngTo = _this2._map._latLngToNewLayerPoint(point, zoom, center),
        x = _this2$_map$_latLngTo.x,
        y = _this2$_map$_latLngTo.y;
      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    };
    this._projectVideoOnMap(videoPosition, pixelicPositionProvider);
  },
  _projectVideoOnMap: function _projectVideoOnMap(origin, pixelicPositionProvider) {
    var corners = this._bounds;
    var videoElement = jquery__WEBPACK_IMPORTED_MODULE_1___default()(this._image);
    var target = _getTargetCorners(corners, pixelicPositionProvider);
    var cssTransformValue = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_3__.areSomeCornersEqual)(target) ? this._projectAsRectangle(target) : this._projectWithProjectiveMatrix(origin, target);
    videoElement.css((0,_utility_css__WEBPACK_IMPORTED_MODULE_4__.getCssWithPrefixes)("transform", cssTransformValue));
    videoElement.css((0,_utility_css__WEBPACK_IMPORTED_MODULE_4__.getCssWithPrefixes)("transform-origin", '0 0 0px'));
  },
  _projectWithProjectiveMatrix: function _projectWithProjectiveMatrix(origin, target) {
    var matrix3d = (0,_utility_projections__WEBPACK_IMPORTED_MODULE_2__.findProjectiveMatrix)(origin, target);
    return (0,_utility_css__WEBPACK_IMPORTED_MODULE_4__.projectiveMatrixToCssValue)(matrix3d);
  },
  _projectAsRectangle: function _projectAsRectangle(target) {
    var videoElement = jquery__WEBPACK_IMPORTED_MODULE_1___default()(this._image);
    var xCoordinates = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_3__.getXCoordinates)(target);
    var yCoordinates = (0,_utility_corners__WEBPACK_IMPORTED_MODULE_3__.getYCoordinates)(target);
    var minX = Math.min.apply(Math, _toConsumableArray(xCoordinates));
    var maxX = Math.max.apply(Math, _toConsumableArray(xCoordinates));
    var minY = Math.min.apply(Math, _toConsumableArray(yCoordinates));
    var maxY = Math.max.apply(Math, _toConsumableArray(yCoordinates));
    var size = {
      height: videoElement.height(),
      width: videoElement.width()
    };
    var afterScalingSize = {
      height: maxY - minY,
      width: maxX - minX
    };
    return "".concat((0,_utility_css__WEBPACK_IMPORTED_MODULE_4__.getTranslate3dCssValue)(minX, minY), " ").concat((0,_utility_css__WEBPACK_IMPORTED_MODULE_4__.getScale3dCssValue)(size, afterScalingSize));
  },
  _getCorners: function _getCorners(value) {
    if ((0,_utility_corners__WEBPACK_IMPORTED_MODULE_3__.isCorners)(value)) return value;
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
;
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