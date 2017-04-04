const fetchJs = require('raw-loader!whatwg-fetch');
const requireJs = require('raw-loader!./require.js');
const connectorJs = require('raw-loader!./connector');
const domtoimageJs = require('raw-loader!dom-to-image');


export default function (module) {
  return [
    fetchJs,
    module ? requireJs : '',
    domtoimageJs,
    connectorJs,
  ].join('\n');
};
