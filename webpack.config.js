const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FeelesWebpackPlugin = require('./feeles-webpack-plugin');

const exportVarName = process.env.EXPORT_VAR_NAME || 'h4p';
const cssPrefix = process.env.CSS_PREFIX || exportVarName + '__';

const CORE_VERSION = require('./version');
const corePrefix = 'h4p-';
const CORE_NAME = corePrefix + CORE_VERSION;
const CORE_CDN_PREFIX =
  'https://embed.hackforplay.xyz/open-source/core/' + corePrefix;

const config = {
  entry: {
    main: ['whatwg-fetch', './lib/url-search-params', './src/main'],
    h4p: ['whatwg-fetch', 'entry-point-dev']
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(jsx?)$/,
        loaders: ['babel-loader'],
        exclude: /node_modules|lib/
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(html|hbs)$/,
        loaders: ['handlebars-loader']
      },
      {
        test: /\.json$/,
        loaders: ['json-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.html', '.json'],
    modules: [path.resolve('./src'), 'node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      INLINE_SCRIPT_ID: JSON.stringify('Feeles-Chromosome'),
      CSS_PREFIX: JSON.stringify(cssPrefix),
      EXPORT_VAR_NAME: JSON.stringify(exportVarName),
      CORE_VERSION: JSON.stringify(CORE_VERSION),
      CORE_CDN_PREFIX: JSON.stringify(CORE_CDN_PREFIX),
      CORE_CDN_URL: JSON.stringify(`${CORE_CDN_PREFIX}${CORE_VERSION}.js`)
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'index.html',
      template: 'samples/hello-world.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      path: 'samples/hello-world',
      output: 'index.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'hack-rpg.html',
      template: 'samples/hack-rpg.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      path: 'samples/hack-rpg',
      output: 'hack-rpg.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'make-rpg.html',
      template: 'samples/make-rpg.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      path: 'samples/make-rpg',
      output: 'make-rpg.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'ask.html',
      template: 'samples/ask.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      path: 'samples/ask',
      output: 'ask.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'matterjs.html',
      template: 'samples/matterjs.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      path: 'samples/matterjs',
      output: 'matterjs.json',
      ignore: /\.DS_Store$/
    })
  ],
  devServer: {
    contentBase: 'dist',
    port: process.env.PORT
  }
};

module.exports = config;
