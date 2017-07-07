const webpack = require('webpack');
const path = require('path');

const config = {
  entry: {
    h4p: './src/entry-point'
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader?cacheDirectory'],
        include: [path.resolve(__dirname, 'src')]
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      INLINE_SCRIPT_ID: JSON.stringify('Feeles-Chromosome')
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  ],
  devtool: 'source-map'
};

if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
  const VersioningWebpackPlugin = require('./versioning-webpack-plugin');
  config.plugins.push(new VersioningWebpackPlugin());
}

module.exports = config;
