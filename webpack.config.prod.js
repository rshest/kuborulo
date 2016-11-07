var webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './src/main.js'],
  
  output: { 
    path: __dirname, 
    filename: 'dist/bundle.js' 
  },
    
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

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
          presets: ['react', 'es2015', 'stage-0']
        }
      } 
    ]
  },
};
