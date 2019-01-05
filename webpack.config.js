const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FeelesWebpackPlugin = require('./src/feeles-webpack-plugin')
const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const HappyPack = require('happypack')
const VersioningWebpackPlugin = require('./versioning-webpack-plugin')

const exportVarName = process.env.EXPORT_VAR_NAME || 'h4p'
const cssPrefix = process.env.CSS_PREFIX || exportVarName + '__'
const version = require('./version')
// 8080 は CodeConnection for Minecraft で決め打ちされているので…
const port = process.env.PORT || 8081

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    index: './src/main'
  },
  output: {
    libraryTarget: 'umd',
    path: __dirname + '/umd/',
    filename: '[name].js'
  },
  module: {
    rules: [
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
      }
    ],
    // https://github.com/webpack/webpack/issues/5135
    strictThisContextOnImports: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  plugins: [
    new webpack.DefinePlugin({
      CSS_PREFIX: JSON.stringify(cssPrefix),
      EXPORT_VAR_NAME: JSON.stringify(exportVarName)
    }),
    new webpack.LoaderOptionsPlugin({ minimize: false, debug: false }),
    new OpenBrowserPlugin({ url: `http://localhost:${port}` }),
    new HappyPack({
      loaders: ['babel-loader?cacheDirectory']
    }),
    // ---- ja ----
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'index.html',
      template: 'templates/index.ja.hbs',
      production: process.env.NODE_ENV === 'production'
    }),
    new FeelesWebpackPlugin({
      paths: ['samples/hello-world'],
      output: 'index.json',
      ignore: /\.DS_Store$/
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
}

if (process.env.NODE_ENV !== 'production') {
  // for Development:
  config.devtool = 'eval'
} else {
  config.devtool = 'cheap-module-source-map'
  config.plugins.push(
    // https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b
    new webpack.optimize.ModuleConcatenationPlugin()
  )
}

// Upload to Azure Blob Storage
if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
  config.plugins.push(new VersioningWebpackPlugin())
}

module.exports = async () => {
  config.plugins.push(
    new webpack.DefinePlugin({
      CORE_VERSION: JSON.stringify(await version.nextVersion()),
      CORE_CDN_URL: JSON.stringify(await version.nextUrl('h4p.js'))
    })
  )
  return config
}
