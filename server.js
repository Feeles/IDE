const http = require('http');
const url = require('url');
const version = require('./version');

const server = http.createServer(async (request, response) => {
  const paths = url.parse(request.url).pathname.split('/');

  // 現在は日本語のみサポート
  if (paths[1] !== 'ja' && paths[1] !== 'h4p.js') {
    paths.splice(1, 0, 'ja');
  }
  const pathname = paths.join('/');

  response.writeHead(303, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    Location: await version.currentUrl(pathname)
  });
  response.end();
});

server.listen(process.env.PORT);
