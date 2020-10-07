(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"), require("leaflet"), require("numeric"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery", "leaflet", "numeric"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("jquery"), require("leaflet"), require("numeric")) : factory(root["jQuery"], root["L"], root["numeric"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function(__WEBPACK_EXTERNAL_MODULE_jquery__, __WEBPACK_EXTERNAL_MODULE_leaflet__, __WEBPACK_EXTERNAL_MODULE_numeric__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/distortableVideoOverlay.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/distortableVideoOverlay.js":
/*!****************************************!*\
  !*** ./src/distortableVideoOverlay.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return distortableVideoOverlay; });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! leaflet */ "leaflet");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utility_projections__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utility/projections */ "./src/utility/projections.js");
/* harmony import */ var _utility_corners__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utility/corners */ "./src/utility/corners.js");
/* harmony import */ var _utility_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utility/css */ "./src/utility/css.js");
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }






var DistortableVideoOverlay = leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.VideoOverlay.extend({
  initialize: function initialize(element, bounds, options) {
    this._url = element;
    this._bounds = this._getCorners(bounds);
    leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.Util.setOptions(this, options);
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
    leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.VideoOverlay.prototype._initImage.call(this);

    this._image.style['objectFit'] = 'fill';
  },
  _reset: function _reset() {
    var _this = this;

    var image = this._image;

    var map = this._map.getContainer();

    jquery__WEBPACK_IMPORTED_MODULE_1___default()(image).css(Object(_utility_css__WEBPACK_IMPORTED_MODULE_4__["getCssWithPrefixes"])("transition", "width 0.05s"));
    image.style.width = jquery__WEBPACK_IMPORTED_MODULE_1___default()(map).width() + 'px';
    image.style.height = jquery__WEBPACK_IMPORTED_MODULE_1___default()(map).height() + 'px';
    var originAfterReset = Object(_utility_corners__WEBPACK_IMPORTED_MODULE_3__["getElementCorners"])(map);

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
    var videoPosition = Object(_utility_corners__WEBPACK_IMPORTED_MODULE_3__["getElementCorners"])(this.image);

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

    var cssTransformValue = Object(_utility_corners__WEBPACK_IMPORTED_MODULE_3__["areSomeCornersEqual"])(target) ? this._projectAsRectangle(target) : this._projectWithProjectiveMatrix(origin, target);
    videoElement.css(Object(_utility_css__WEBPACK_IMPORTED_MODULE_4__["getCssWithPrefixes"])("transform", cssTransformValue));
    videoElement.css(Object(_utility_css__WEBPACK_IMPORTED_MODULE_4__["getCssWithPrefixes"])("transform-origin", '0 0 0px'));
  },
  _projectWithProjectiveMatrix: function _projectWithProjectiveMatrix(origin, target) {
    var matrix3d = Object(_utility_projections__WEBPACK_IMPORTED_MODULE_2__["findProjectiveMatrix"])(origin, target);
    return Object(_utility_css__WEBPACK_IMPORTED_MODULE_4__["projectiveMatrixToCssValue"])(matrix3d);
  },
  _projectAsRectangle: function _projectAsRectangle(target) {
    var videoElement = jquery__WEBPACK_IMPORTED_MODULE_1___default()(this._image);
    var xCoordinates = Object(_utility_corners__WEBPACK_IMPORTED_MODULE_3__["getXCoordinates"])(target);
    var yCoordinates = Object(_utility_corners__WEBPACK_IMPORTED_MODULE_3__["getYCoordinates"])(target);
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
    return "".concat(Object(_utility_css__WEBPACK_IMPORTED_MODULE_4__["getTranslate3dCssValue"])(minX, minY), " ").concat(Object(_utility_css__WEBPACK_IMPORTED_MODULE_4__["getScale3dCssValue"])(size, afterScalingSize));
  },
  _getCorners: function _getCorners(value) {
    if (Object(_utility_corners__WEBPACK_IMPORTED_MODULE_3__["isCorners"])(value)) return value;
    if (this._isPointArray(value)) return this._pointArrayToCorners(value);
    return this._boundsToCorners(value);
  },
  _boundsToCorners: function _boundsToCorners(bounds) {
    bounds = leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.latLngBounds(bounds);
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
leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.DistortableVideoOverlay = DistortableVideoOverlay;
leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.distortableVideoOverlay = distortableVideoOverlay;

/***/ }),

/***/ "./src/utility/corners.js":
/*!********************************!*\
  !*** ./src/utility/corners.js ***!
  \********************************/
/*! exports provided: isCorners, getElementCorners, calculateRectangleCorners, areSomeCornersEqual, areCornersEqual, getXCoordinates, getYCoordinates */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCorners", function() { return isCorners; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getElementCorners", function() { return getElementCorners; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "calculateRectangleCorners", function() { return calculateRectangleCorners; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "areSomeCornersEqual", function() { return areSomeCornersEqual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "areCornersEqual", function() { return areCornersEqual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getXCoordinates", function() { return getXCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getYCoordinates", function() { return getYCoordinates; });
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
/*! exports provided: getCssWithPrefixes, projectiveMatrixToCssValue, getScale3dCssValue, getTranslate3dCssValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCssWithPrefixes", function() { return getCssWithPrefixes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "projectiveMatrixToCssValue", function() { return projectiveMatrixToCssValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScale3dCssValue", function() { return getScale3dCssValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getTranslate3dCssValue", function() { return getTranslate3dCssValue; });
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getCssWithPrefixes(key, value) {
  var _ref;

  return _ref = {}, _defineProperty(_ref, "-webkit-" + key, value), _defineProperty(_ref, "-khtml-" + key, value), _defineProperty(_ref, "-moz-" + key, value), _defineProperty(_ref, "-ms-" + key, value), _defineProperty(_ref, "-o-" + key, value), _defineProperty(_ref, key, value), _ref;
}
function projectiveMatrixToCssValue(matrix) {
  var matrixValues = [];

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      matrixValues.push(matrix[j][i].toFixed(20));
    }
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
/*! exports provided: findProjectiveMatrix */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findProjectiveMatrix", function() { return findProjectiveMatrix; });
/* harmony import */ var numeric__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! numeric */ "numeric");
/* harmony import */ var numeric__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(numeric__WEBPACK_IMPORTED_MODULE_0__);

function findProjectiveMatrix(origin, target) {
  var matrix = [];
  var b = [];

  _addCondition(matrix, b, origin.topLeft, target.topLeft);

  _addCondition(matrix, b, origin.topRight, target.topRight);

  _addCondition(matrix, b, origin.bottomLeft, target.bottomLeft);

  _addCondition(matrix, b, origin.bottomRight, target.bottomRight);

  var x = numeric__WEBPACK_IMPORTED_MODULE_0___default.a.solve(matrix, b);
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

/***/ "jquery":
/*!******************************************************************************************!*\
  !*** external {"commonjs":"jquery","commonjs2":"jquery","amd":"jquery","root":"jQuery"} ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_jquery__;

/***/ }),

/***/ "leaflet":
/*!****************************************************************************************!*\
  !*** external {"commonjs":"leaflet","commonjs2":"leaflet","amd":"leaflet","root":"L"} ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_leaflet__;

/***/ }),

/***/ "numeric":
/*!**************************!*\
  !*** external "numeric" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_numeric__;

/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map