var path = require('path');
var webpack = require('webpack');
 
module.exports = {
  entry: ['babel-polyfill', './src/App.js'],
  output: { path: __dirname, filename: 'dist/bundle.js' },
  cache: true,
  debug: true,
  devtool: 'source-map',
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    loaders: [
      { 
        test: /\.json$/, 
        loader: 'json' 
      },
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'es2015', 'stage-3']
        }
      } 
    ]
  },
};
