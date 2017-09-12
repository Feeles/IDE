const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FeelesWebpackPlugin = require('./feeles-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const HappyPack = require('happypack');

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
    ]
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.(jsx?)$/,
        loaders: ['happypack/loader'],
        include: [path.resolve(__dirname, 'src')]
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
    ],
    // https://github.com/webpack/webpack/issues/5135
    strictThisContextOnImports: true
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
      ENTRY_POINT_DEV: JSON.stringify(`http://localhost:${port}`),
      'process.env.ROLLBAR': JSON.stringify(process.env.ROLLBAR),
      'process.env.GA_TRACKING_ID': JSON.stringify(process.env.GA_TRACKING_ID)
    }),

    new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),

    new OpenBrowserPlugin({ url: `http://localhost:${port}/ja/mc.html` }),

    new HappyPack({
      loaders: ['babel-loader?cacheDirectory']
    }),

    // ---- ja ----
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'ja/index.html',
      template: 'templates/index.ja.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/hello-world'],
      output: 'index.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'ja/ask.html',
      template: 'samples/ja/ask.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/ja/ask'],
      output: 'ja/ask.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'ja/matterjs.html',
      template: 'samples/ja/matterjs.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/ja/matterjs'],
      output: 'ja/matterjs.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'ja/mc.html',
      template: 'samples/ja/mc.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/ja/mc'],
      output: 'ja/mc.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'ja/dynamic.html',
      template: 'samples/ja/dynamic.hbs',
      production: process.env.NODE_ENV === 'production'
    }),

    // ---- en ----
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'en/index.html',
      template: 'templates/index.en.hbs',
      production: process.env.NODE_ENV === 'production'
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'en/ask.html',
      template: 'samples/en/ask.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/en/ask', 'samples/ja/ask'],
      output: 'en/ask.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'en/matterjs.html',
      template: 'samples/en/matterjs.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/en/matterjs', 'samples/ja/matterjs'],
      output: 'en/matterjs.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'en/mc.html',
      template: 'samples/en/mc.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/en/mc', 'samples/ja/mc'],
      output: 'en/mc.json',
      ignore: /\.DS_Store$/
    }),

    new HtmlWebpackPlugin({
      inject: false,
      filename: 'en/dynamic.html',
      template: 'samples/en/dynamic.hbs',
      production: process.env.NODE_ENV === 'production'
    })
  ],
  devServer: {
    contentBase: 'dist',
    port,
    // https://github.com/webpack/webpack-dev-server/issues/882
    // ngrok で https のテストをするとき "Invalid Host header" になるので.
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*'
    }
  }
};

if (process.env.NODE_ENV !== 'production') {
  // for Development:
  config.devtool = 'eval';
  // entry point in Development
  config.entry.h4p = ['whatwg-fetch', 'entry-point-dev'];
} else {
  config.devtool = 'source-map';
  config.plugins.push(
    // https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b
    new webpack.optimize.ModuleConcatenationPlugin()
  );
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
