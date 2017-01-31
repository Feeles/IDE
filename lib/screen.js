const fetchJs = require('raw-loader!whatwg-fetch');
const requireJs = require('raw-loader!./require.js');
const connectorJs = require('raw-loader!./connector');


export default function (module) {
  return [
    fetchJs,
    module ? requireJs : '',
    connectorJs,
  ].join('\n');
};
