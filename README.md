# Leaflet.DistortableVideo
Enable to distort videos on Leaflet maps. Leaflet.DistortableVideo allows for perspective distortions of images, client-side, using CSS3 transformations in the DOM.

## Demo
**https://ronikar.github.io/Leaflet.DistortableVideo/examples/**

| Example | Leaflet | Shows |
| --- | --- | --- |
| [`corners.html`](https://ronikar.github.io/Leaflet.DistortableVideo/examples/corners.html) | 1.9.4 | Footage stored 30° off north-up, registered by four named corners |
| [`bounds.html`](https://ronikar.github.io/Leaflet.DistortableVideo/examples/bounds.html) | 1.9.4 | North-up footage, `LatLngBounds` input, axis-aligned |
| [`pointArray.html`](https://ronikar.github.io/Leaflet.DistortableVideo/examples/pointArray.html) | 1.9.4 | The same rotated footage, corners as a clockwise array |
| [`rotate.html`](https://ronikar.github.io/Leaflet.DistortableVideo/examples/rotate.html) | 1.9.4 | Rotated footage on a rotated map via `leaflet-rotate-map` |
| [`leaflet2.html`](https://ronikar.github.io/Leaflet.DistortableVideo/examples/leaflet2.html) | 2.0.0-alpha.1 | Side by side against stock `L.VideoOverlay` |

## Requirements
### Dependancies
* Leaflet 1.x or 2.x — the same build supports both, see [Leaflet 2](#leaflet-2)

### Browser Compatibility
Your browser must support the next features
* object-fit for video element - https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
* matrix3d() - https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d

## Usage

### Setup

```sh
npm install leaflet-distortable-video
```

The plugin gives you a factory and the class it constructs, following Leaflet's own convention:

| | | |
| --- | --- | --- |
| `distortableVideoOverlay(video, corners, options)` | factory | returns a new overlay |
| `DistortableVideoOverlay` | class | use with `new`, extends `L.VideoOverlay` |

Both are named exports, and both are also registered on `L`.

Import them by name — this works under every bundler and in Node:

```js
import L from 'leaflet';
import { distortableVideoOverlay, DistortableVideoOverlay } from 'leaflet-distortable-video';

distortableVideoOverlay(videoUrl, corners, { opacity: 0.8 }).addTo(map);
new DistortableVideoOverlay(videoUrl, corners, { opacity: 0.8 }).addTo(map);
```

> There is also a default export, but do not rely on it. The package is UMD, so under native Node
> ESM the default resolves to `module.exports` — an object, not the factory — and calling it throws.
> Bundlers unwrap it, Node does not. Use the named imports.

With a `<script>` tag, load Leaflet first and the plugin registers itself on `L`:

```html
<script src="leaflet.js"></script>
<script src="node_modules/leaflet-distortable-video/dist/index.min.js"></script>
<script>
  L.distortableVideoOverlay(videoUrl, corners, { opacity: 0.8 }).addTo(map);
  new L.DistortableVideoOverlay(videoUrl, corners, { opacity: 0.8 }).addTo(map);
</script>
```

> `L.distortableVideoOverlay` and `L.DistortableVideoOverlay` are unavailable when Leaflet resolves
> as an ES module — use the package's exports instead.

### distortableVideoOverlay(videoUrl, corners, options)

Specify the video URL or videoElement, four corner points, and any `L.VideoOverlay` options,
for example:

```js
var corners= {
            topLeft: L.latLng([30,-129]),
            topRight: L.latLng([32,-100]),
            bottomRight: L.latLng([13,-97]),
            bottomLeft: L.latLng([13,-130])
};

let layer = L.distortableVideoOverlay("examples/media/pacific-rotated.mp4", corners, {
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

let layer = L.distortableVideoOverlay("examples/media/pacific-rotated.mp4", corners, {
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

### getCorners() and getBounds()

`getCorners()` returns the four corners as given, which is what round-trips with
`setCorners()`. `getBounds()` is inherited from Leaflet and returns their
axis-aligned `LatLngBounds` - useful for `map.fitBounds(overlay.getBounds())`,
but it cannot describe a rotated or distorted quad.

```js
overlay.getCorners(); // { topLeft, topRight, bottomRight, bottomLeft }
map.fitBounds(overlay.getBounds());
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
version switch. See [`examples/leaflet2.html`](https://ronikar.github.io/Leaflet.DistortableVideo/examples/leaflet2.html).

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

`examples/media/pacific.mp4` and `pacific-rotated.mp4` are built from [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/)
satellite imagery (public domain) by `tools/make-demo-video.mjs`, which also prints the four
corners to display it at.

```sh
npm run demo:video -- --bounds 13,-130,32,-100 --rotate 30 \
  --layer VIIRS_SNPP_CorrectedReflectance_TrueColor \
  --dates 2024-10-08..2024-10-15 --out examples/media/pacific-rotated.mp4
```

The point of generating rather than hotlinking is that the footprint is known exactly, so the
coastlines in the video line up with the coastlines on the basemap instead of approximately
matching. `--rotate` turns the imagery off north-up, which is what makes the overlay do a real
projective placement rather than a scale-and-translate.

Requires `ffmpeg` on `PATH`. Run `npm run demo:video -- --help` for all options.

### Running the examples offline

The examples have no network dependencies. Leaflet, `leaflet-rotate-map` and the marker icons are
vendored under `examples/vendor/`, and both video clips are in `examples/media/`.

The basemap is the one thing that cannot be self-contained — a tile layer needs a tile server. So
each example also carries a static Blue Marble image (`media/basemap.jpg`, GIBS, public domain) in a
pane *below* the tile layer. Online the tiles cover it completely; offline it is what you see, so
the video still has recognisable ground to be registered against. It spans 0–45°N, 140–85°W, which
covers the demo area; pan outside that and the background is empty.

Serve the folder over HTTP rather than opening the files directly, since browsers block `file://`
media and XHR:

```sh
python3 -m http.server 8000    # then open http://localhost:8000/examples/
```

### Module Loaders
The index file is built by using `rollup` into a UMD bundle, so it can be loaded with a plain
`<script>` tag or through a module loader such as AMD or CommonJS. Run `npm run build` to rebuild
`dist/`, or `npm run watch` while developing. 


## License
MIT License (MIT)

