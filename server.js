const http = require('http')
const url = require('url')
const version = require('./version')

const server = http.createServer(async (request, response) => {
  const paths = url.parse(request.url).pathname.split('/')

  let distination
  if (paths[2] === 'hack-rpg.html') {
    // hack-rpg の場合は hack-rpg.hackforplay.xyz に移動
    distination = 'https://hack-rpg.hackforplay.xyz/' + paths[1]
  } else if (paths[2] === 'make-rpg.html') {
    // make-rpg の場合は make-rpg.hackforplay.xyz に移動
    distination = 'https://make-rpg.hackforplay.xyz/' + paths[1]
  } else {
    // assets.feeles.com/public/v1XXX/xxx.html に移動
    distination = await version.currentUrl(paths.join('/'))
  }

  response.writeHead(303, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    Location: distination
  })
  response.end()
})

server.listen(process.env.PORT)
