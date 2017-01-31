const fetchJs = require('raw!whatwg-fetch');
const requireJs = require('raw!./require.js');
const connectorJs = require('raw!./connector');


export default function (module) {
  return [
    fetchJs,
    module ? requireJs : '',
    connectorJs,
  ].join('\n');
};
