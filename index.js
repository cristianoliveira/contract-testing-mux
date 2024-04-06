const proxyConfig = require('./proxy.json');

var http = require('http');

http.createServer(onRequest).listen(4400);

function onRequest(req, res) {
  console.log('serve: ' + req.url);

  const { providers } = proxyConfig;

  const [,providerName,] = req.url.split('/')
  const provider = providers.find(p => req.url.includes(p.name));

  var options = {
    hostname: provider.hostname,
    port: provider.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  var proxy = http.request(options, function (proxy_res) {
    res.writeHead(res.statusCode, res.headers)
    proxy_res.pipe(res, {
      end: true
    });
  });

  req.pipe(proxy, {
    end: true
  });
}
