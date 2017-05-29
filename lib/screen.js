const fetchJs = require('raw-loader!whatwg-fetch');
const requireJs = require('raw-loader!./require.js');
const connectorJs = require('raw-loader!./connector');
const domtoimageJs = require('raw-loader!dom-to-image');
const eventEmitter3Js = require('raw-loader!eventemitter3/umd/eventEmitter3.min');

export default function(module) {
  return [
    fetchJs,
    eventEmitter3Js,
    module ? requireJs : '',
    domtoimageJs,
    connectorJs
  ].join('\n');
}
