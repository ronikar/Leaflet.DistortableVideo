# Leaflet.DistortableVideo
Enable to distort videos on Leaflet maps. Leaflet.DistortableVideo allows for perspective distortions of images, client-side, using CSS3 transformations in the DOM.

## Demo
**https://ronikar.github.io/Leaflet.DistortableVideo/examples/**

| Example | Leaflet | Shows |
| --- | --- | --- |
| [`corners.html`](examples/corners.html) | 1.9.4 | Four named corners — the general perspective case |
| [`bounds.html`](examples/bounds.html) | 1.9.4 | `LatLngBounds` input, axis-aligned |
| [`pointArray.html`](examples/pointArray.html) | 1.9.4 | The same corners as a clockwise array |
| [`rotate.html`](examples/rotate.html) | 1.9.4 | Rotated map via `leaflet-rotate-map` |
| [`leaflet2.html`](examples/leaflet2.html) | 2.0.0-alpha.1 | All three input shapes on Leaflet 2 |
| [`rotatedVideo.html`](examples/rotatedVideo.html) | 1.9.4 | Footage stored off north-up, placed back onto the ground |

## Requirements
### Dependancies
* Leaflet 1.x or 2.x — the same build supports both, see [Leaflet 2](#leaflet-2)

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

### Leaflet 2

The same build works on Leaflet 1 and Leaflet 2 — there is no separate entry point and no
version switch. See [`examples/leaflet2.html`](examples/leaflet2.html).

Two things change on the **calling** side, not in this plugin:

* Leaflet 2 removed the lowercase factories, so `L.map(...)` becomes `new L.Map(...)`,
  `L.latLng(...)` becomes `new L.LatLng(...)`, and so on.
* Leaflet 2's default entry point is an ES module. A plain `<script>` page needs the build
  that still exposes the global `L`:

```html
<script src="https://unpkg.com/leaflet@2.0.0-alpha.1/dist/leaflet-global.js"></script>
<script src="dist/index.js"></script>
```

```js
const map = new L.Map('map');

L.distortableVideoOverlay(videoUrl, corners, { opacity: 0.8 }).addTo(map);
```

All three `corners` shapes — the named-corners object, a `LatLngBounds`, and a point array —
behave identically on both majors.

> **Leaflet 2 support is provisional.** 2.0.0-alpha.1 is still an alpha, and this plugin
> overrides several of Leaflet's internal overlay methods (`_initImage`, `_reset`,
> `_animateZoom`). Those carry no compatibility guarantee across a major that has not
> stabilised yet. TypeScript users should also note that `@types/leaflet` has no 2.x release,
> and Leaflet 2 ships no type declarations of its own.

### Generating a demo video

`examples/media/rotated.mp4` is built from [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/)
satellite imagery (public domain) by `tools/make-demo-video.mjs`, which also prints the four
corners to display it at.

```sh
npm run demo:video -- --bounds 13,-130,32,-100 --rotate 30 \
  --layer VIIRS_SNPP_CorrectedReflectance_TrueColor \
  --dates 2024-10-08..2024-10-15 --out examples/media/rotated.mp4
```

The point of generating rather than hotlinking is that the footprint is known exactly, so the
coastlines in the video line up with the coastlines on the basemap instead of approximately
matching. `--rotate` turns the imagery off north-up, which is what makes the overlay do a real
projective placement rather than a scale-and-translate.

Requires `ffmpeg` on `PATH`. Run `npm run demo:video -- --help` for all options.

### Module Loaders
The index file is built by using `rollup` into a UMD bundle, so it can be loaded with a plain
`<script>` tag or through a module loader such as AMD or CommonJS. Run `npm run build` to rebuild
`dist/`, or `npm run watch` while developing. 


## License
MIT License (MIT)

