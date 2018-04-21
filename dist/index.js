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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = distortableVideoOverlay;

var _numeric = _interopRequireDefault(__webpack_require__(/*! numeric */ "numeric"));

var _leaflet = _interopRequireDefault(__webpack_require__(/*! leaflet */ "leaflet"));

var _jquery = _interopRequireDefault(__webpack_require__(/*! jquery */ "jquery"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DistortableVideoOverlay = _leaflet.default.VideoOverlay.extend({
  initialize: function initialize(element, bounds, options) {
    this._url = element;
    this._bounds = this._isCorners(bounds) ? bounds : this._boundsToCorners(bounds);

    _leaflet.default.Util.setOptions(this, options);
  },
  setBounds: function setBounds(bounds) {
    return this.setCorners(this._boundsToCorners(bounds));
  },
  setCorners: function setCorners(corners) {
    this._bounds = corners;

    if (this._map) {
      this._reset();
    }

    return this;
  },
  _animateZoom: function _animateZoom(e) {
    var _this = this;

    var zoom = e.zoom,
        center = e.center;

    var pixelicPositionProvider = function pixelicPositionProvider(point) {
      var _this$_map$_latLngToN = _this._map._latLngToNewLayerPoint(point, zoom, center),
          x = _this$_map$_latLngToN.x,
          y = _this$_map$_latLngToN.y;

      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    };

    this._projectVideoOnMap(pixelicPositionProvider);
  },
  _projectVideoOnMap: function _projectVideoOnMap(pixelicPositionProvider) {
    var corners = this._bounds;

    var videoOrigin = _getVideoCorners(this._image);

    var videoTarget = _getTargetCorners(corners, pixelicPositionProvider);

    var matrix3d = _findProjectiveMatrix(videoOrigin, videoTarget);

    this._image.style['transform'] = _projectiveMatrixToCssValue(matrix3d);
    this._image.style['transform-origin'] = '0 0 0px';
  },
  _reset: function _reset() {
    var _this2 = this;

    var image = this._image;
    var mapElement = (0, _jquery.default)(this._map.getContainer());
    image.style.width = mapElement.width() + 'px';
    image.style.height = mapElement.height() + 'px';

    var pixelicPositionProvider = function pixelicPositionProvider(point) {
      var _this2$_map$latLngToL = _this2._map.latLngToLayerPoint(point),
          x = _this2$_map$latLngToL.x,
          y = _this2$_map$latLngToL.y;

      return {
        x: Math.round(x),
        y: Math.round(y)
      };
    };

    this._projectVideoOnMap(pixelicPositionProvider);
  },
  _initImage: function _initImage() {
    _leaflet.default.VideoOverlay.prototype._initImage.call(this);

    this._image.style['objectFit'] = 'fill';
  },
  _boundsToCorners: function _boundsToCorners(bounds) {
    bounds = _leaflet.default.latLngBounds(bounds);
    return {
      topLeft: bounds.getNorthWest(),
      topRight: bounds.getNorthEast(),
      bottomLeft: bounds.getSouthWest(),
      bottomRight: bounds.getSouthEast()
    };
  },
  _isCorners: function _isCorners(value) {
    var topLeft = value.topLeft,
        topRight = value.topRight,
        bottomLeft = value.bottomLeft,
        bottomRight = value.bottomRight;
    return !!topLeft && !!topRight && !!bottomLeft && !!bottomRight;
  }
});

var _getTargetCorners = function _getTargetCorners(geographicCorners, pixelicPositionProvider) {
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
};

function _getVideoCorners(videoElement) {
  var element = (0, _jquery.default)(videoElement);
  var height = element.height();
  var width = element.width();
  var top = 0;
  var left = 0;
  var right = left + width;
  var bottom = top + height;
  var topLeft = {
    x: left,
    y: top
  };
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

function _findProjectiveMatrix(origin, target) {
  var matrix = [];
  var b = [];

  _addCondition(matrix, b, origin.topLeft, target.topLeft);

  _addCondition(matrix, b, origin.topRight, target.topRight);

  _addCondition(matrix, b, origin.bottomLeft, target.bottomLeft);

  _addCondition(matrix, b, origin.bottomRight, target.bottomRight);

  var x = _numeric.default.solve(matrix, b);

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

function _projectiveMatrixToCssValue(matrix) {
  var matrixValues = [];

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      matrixValues.push(matrix[j][i].toFixed(20));
    }
  }

  return "matrix3d(".concat(matrixValues.join(','), ")");
}

function distortableVideoOverlay(url, corners, options) {
  return new DistortableVideoOverlay(url, corners, options);
}

_leaflet.default.DistortableVideoOverlay = DistortableVideoOverlay;
_leaflet.default.distortableVideoOverlay = distortableVideoOverlay;

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