var fetchJs = require('raw-loader!whatwg-fetch');
var requireJs = require('raw-loader!./require.js');
var connectorJs = require('raw-loader!./connector');
var domtoimageJs = require('raw-loader!dom-to-image');
var eventEmitter2Js = require('raw-loader!eventemitter2');

module.exports = function(module) {
  return [
    fetchJs,
    eventEmitter2Js,
    module ? requireJs : '',
    domtoimageJs,
    connectorJs
  ].join('\n');
};
