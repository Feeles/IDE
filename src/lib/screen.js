var fetchPonyfill = require('raw-loader!fetch-ponyfill');
var requireJs = require('raw-loader!./require.js');
var connectorJs = require('raw-loader!./connector');
var domtoimageJs = require('raw-loader!dom-to-image');
var eventEmitter2Js = require('raw-loader!eventemitter2');
var babelPolyfill = require('raw-loader!@babel/polyfill/browser');

module.exports = function(module) {
  return [
    babelPolyfill,
    fetchPonyfill,
    eventEmitter2Js,
    module ? requireJs : '',
    domtoimageJs,
    connectorJs
  ].join('\n');
};
