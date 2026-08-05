# Leaflet.DistortableVideo
Enable to distort videos on Leaflet maps. Leaflet.DistortableVideo allows for perspective distortions of images, client-side, using CSS3 transformations in the DOM.

## Demo
https://ronikar.github.io/Leaflet.DistortableVideo/examples/

## Requirements
### Dependancies
* Leaflet 1.^
* JQuery 

### Browser Compatibility
Your browser must support the next features
* object-fit for video element - https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
* matrix3d() - https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d

## Usage

### Setup

* Add script to html. You can use `index.js` or `index.min.js` in `./dist` folder. 
```html
<script src="distortableVideoOverlay.js"></script>
```

* You can also use `npm install leaflet-distortable-video` or `yarn add leaflet-distortable-video`.

### L.distortableVideo(videoUrl, corners, options)

To instantiate a `L.DistortableVideo`, specify the video URL or videoElement, four corner
points, and any `L.VideoOverlay` options in the `L.distortableVideo` factory
method, for example:

```js
var corners= {
            topLeft: L.latLng([30,-129]),
            topRight: L.latLng([32,-100]),
            bottomRight: L.latLng([13,-97]),
            bottomLeft: L.latLng([13,-130])
};

let layer = L.distortableVideoOverlay("https://www.mapbox.com/bites/00188/patricia_nasa.mp4", corners, {
  opacity: 0.8
}).addTo(map);
```

`topLeft`, `topRight`, `bottomLeft` and `bottomRight` are instances of `L.LatLng`, corresponding
to the locations of the corners of the video. `corners` can be also `L.LatlngBounds` in factory method.

`Corners` can be also array of points. The order of the points is `topLeft`, `topRight`, `bottomRight` and `bottomLeft`.

```js
var topLeft = L.latLng([30, -129]);
var topRight = L.latLng([32, -100]);
var bottomRight = L.latLng([13, -97]);
var bottomLeft = L.latLng([13, -130]);
var corners = [topLeft, topRight, bottomRight, bottomLeft];

let layer = L.distortableVideoOverlay("https://www.mapbox.com/bites/00188/patricia_nasa.mp4", corners, {
  opacity: 0.8
}).addTo(map);
```

### setCorners(corners)

This function enables to relocate the video on the map, for example: 

```js
var corners= {
            topLeft: L.latLng([30,-129]),
            topRight: L.latLng([32,-100]),
            bottomRight: L.latLng([13,-97]),
            bottomLeft: L.latLng([13,-130])
};

overlay.setCorners(corners);
```

### Rotated maps

The overlay works on a rotated map without any extra configuration. The corners are
projected with `latLngToLayerPoint`, which is unaffected by the map bearing, and the
video sits inside the rotate pane, so the pane's rotation composes with the
`matrix3d` the plugin computes.

See `examples/rotate.html`, which uses
[leaflet-rotate-map](https://www.npmjs.com/package/leaflet-rotate-map) — a drop-in
replacement for `leaflet` that adds rotation — and lets you drag the bearing from
0° to 360°:

```js
var map = L.map('map', { rotate: true });

L.distortableVideoOverlay(videoUrl, corners, { opacity: 0.8 }).addTo(map);

map.setBearing(45);
```

### Module Loaders
The index file is built by using `rollup` into a UMD bundle, so it can be loaded with a plain
`<script>` tag or through a module loader such as AMD or CommonJS. Run `npm run build` to rebuild
`dist/`, or `npm run watch` while developing. 


## License
MIT License (MIT)

