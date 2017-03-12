const webpack = require('webpack');

const CORE_VERSION = 'beta-6d';
const corePrefix = 'h4p-';
const CORE_NAME = corePrefix + CORE_VERSION;

const config = {
  entry: {
    h4p: './src/entry-point',
    [CORE_NAME]: './src/entry-point',
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules'
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      INLINE_SCRIPT_ID: JSON.stringify('Feeles-Chromosome'),
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  ],
};


module.exports = config;
