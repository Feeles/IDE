const http = require('http');
const url = require('url');

const server = http.createServer((request, response) => {
  const { pathname } = url.parse(request.url);
  response.writeHead(303, {
    Location: process.env.CDN + pathname
  });
  response.end();
});

server.listen(process.env.PORT);
