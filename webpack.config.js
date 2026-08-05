const path = require('path');
const isProduction = process.env.NODE_ENV == 'production';

const config = {
    entry: './src/distortableVideoOverlay.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `${!isProduction ? "index" : "index.min"}.js`,
        library: 'leaflet-distortable-video',
        libraryTarget: 'umd',
        // Without this, webpack 5 defaults to `self` for a UMD bundle. `self` is
        // evaluated eagerly as the wrapper's argument, so it throws in Node
        // before the CommonJS branch is ever reached, which breaks require() and
        // any server-side render.
        globalObject: "typeof self !== 'undefined' ? self : this"
    },
    module: {
        rules: [
            {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
     ]
    },
    devtool: 'source-map',
    externals: {
      leaflet: {
        commonjs: "leaflet",
        commonjs2: "leaflet",
        amd: "leaflet",
        root: "L"
      }
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
