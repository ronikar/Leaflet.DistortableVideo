# Leaflet.DistortableVideo
Enable to distort videos on Leaflet maps. Leaflet.DistortableVideo allows for perspective distortions of images, client-side, using CSS3 transformations in the DOM.

## Demo
https://ronikar.github.io/Leaflet.DistortableVideo/examples/

## Requirements
* Leaflet 1.^
* Numeric.js 1.2.6 
* JQuery 

## Browser Compatibility
Your browser must to support the next features
* object-fit css for video element - https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
* matrix3d() css - https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d

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

### Module Loaders
The index file is built by using `webpack`, in order to enable to use module loaders such as AMD and CommonJS. 


## License
MIT License (MIT)

