var fetchPonyfill = require('raw-loader!fetch-ponyfill');
var requireJs = require('raw-loader!./require.js');
var connectorJs = require('raw-loader!./connector');
var domtoimageJs = require('raw-loader!dom-to-image');
var eventEmitter2Js = require('raw-loader!eventemitter2');
var babelRuntime = require('./babel-runtime');

module.exports = function(module) {
  return [
    fetchPonyfill,
    eventEmitter2Js,
    module ? requireJs : '',
    babelRuntime,
    domtoimageJs,
    connectorJs
  ].join('\n');
};
