const fetchJs = require('raw-loader!whatwg-fetch');
const requireJs = require('raw-loader!./require.js');
const connectorJs = require('raw-loader!./connector');
const domtoimageJs = require('raw-loader!dom-to-image');
const eventEmitter2Js = require('raw-loader!eventemitter2');

export default function(module) {
  return [
    fetchJs,
    eventEmitter2Js,
    module ? requireJs : '',
    domtoimageJs,
    connectorJs
  ].join('\n');
}
