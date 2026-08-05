import terser from '@rollup/plugin-terser';

// leaflet stays external and is read off the page global in the UMD build,
// exactly as the previous webpack `externals` block declared. It is the only
// external now that the jQuery dependency is gone.
const external = ['leaflet'];
const globals = { leaflet: 'L' };

// `exports: 'named'` is deliberate. The source has only a default export, so
// Rollup would otherwise emit the factory itself as module.exports, whereas the
// old webpack UMD emitted { default: fn, __esModule: true }. Keeping 'named'
// preserves that shape so `require(...)` consumers do not break.
const output = (file, minify) => ({
    file,
    format: 'umd',
    name: 'leaflet-distortable-video',
    globals,
    sourcemap: true,
    exports: 'named',
    esModule: true,
    plugins: minify ? [terser()] : []
});

export default {
    input: 'src/distortableVideoOverlay.js',
    external,
    output: [
        output('dist/index.js', false),
        output('dist/index.min.js', true)
    ]
};
