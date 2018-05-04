var webpack = require('webpack');
var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = (env, options) => ({
  entry: path.resolve(__dirname, 'src/distortableVideoOverlay.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${options.mode !== "production" ? "index" : "index.min"}.js`,
    library: '',
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
  }
});