const path = require('path');
const isProduction = process.env.NODE_ENV == 'production';

const config = {
    entry: './src/distortableVideoOverlay.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `${!isProduction ? "index" : "index.min"}.js`,
        library: 'leaflet-distortable-video',
        libraryTarget: 'umd'
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
      jquery: {
        commonjs: "jquery",
        commonjs2: "jquery",
        amd: "jquery",
        root: "jQuery"
      },
      leaflet: {
        commonjs: "leaflet",
        commonjs2: "leaflet",
        amd: "leaflet",
        root: "L"
      },
      numeric: "numeric"
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
