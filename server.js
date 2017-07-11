const http = require('http');
const url = require('url');
const version = require('./version');

const server = http.createServer(async (request, response) => {
  const { pathname } = url.parse(request.url);
  response.writeHead(303, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    Location: await version.currentUrl(pathname)
  });
  response.end();
});

server.listen(process.env.PORT);
