const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FeelesWebpackPlugin = require('./feeles-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const exportVarName = process.env.EXPORT_VAR_NAME || 'h4p';
const cssPrefix = process.env.CSS_PREFIX || exportVarName + '__';
const version = require('./version');
// 8080 は CodeConnection for Minecraft で決め打ちされているので…
const port = process.env.PORT || 8081;

const config = {
  entry: {
    main: [
      'normalize.css',
      'animate.css',
      'whatwg-fetch',
      './lib/url-search-params',
      './src/utils/google-analytics',
      './src/utils/Rollbar',
      './src/main'
    ],
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
      'process.env.ROLLBAR': JSON.stringify(process.env.ROLLBAR),
      'process.env.GA_TRACKING_ID': JSON.stringify(process.env.GA_TRACKING_ID)
    }),
    new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
    new OpenBrowserPlugin({ url: `http://localhost:${port}` }),

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
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'mc.html',
      template: 'samples/mc.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      path: 'samples/mc',
      output: 'mc.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'dynamic.html',
      template: 'samples/dynamic.hbs',
      production: process.env.NODE_ENV === 'production'
    })
  ],
  devServer: {
    contentBase: 'dist',
    port,
    // https://github.com/webpack/webpack-dev-server/issues/882
    // ngrok で https のテストをするとき "Invalid Host header" になるので.
    disableHostCheck: true
  }
};

if (process.env.NODE_ENV !== 'production') {
  // for Development:
  config.devtool = 'eval';
} else {
  config.devtool = 'source-map';
}

module.exports = async () => {
  config.plugins.push(
    new webpack.DefinePlugin({
      CORE_VERSION: JSON.stringify(await version.nextVersion()),
      CORE_CDN_URL: JSON.stringify(await version.nextUrl('h4p.js'))
    })
  );
  version.quit();
  return config;
};
