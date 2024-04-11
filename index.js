/**
 * @typedef {import('http')} http
 */
const http = require('http');

/**
 * @typedef proxyConfig
 * @type {Object}
 * @property {string} name
 * @property {string} hostname
 * @property {number} port
 * @property {string} openapiFile
 */
const proxyConfig = require('./proxy.json');

/**
 * @typedef {import('./routing').createExamplesUrlsForProviders} examplesUrlMap
 */
const examplesUrlMap = require('./match-example.js');

const { providers } = proxyConfig;


examplesUrlMap(providers).then((examplesMap) => {
  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  async function onRequest(req, res) {
    console.log('Request host: ' + req.headers.host);

    const [providerName,] = req.headers.host.split('.');

    const provider = providers.find(p => p.name === providerName);
    if (!provider) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Provider ${providerName} not found`);
      return;
    }

    const providerExamples = examplesMap[providerName] || {};
    const example = providerExamples[req.url];
    const path =  new URL(req.url, "http://localhost");

    let specialHeader = ""
    const status = Number(example?.status || 0);
    // See https://github.com/stoplightio/prism/blob/c1145066f9e1f8d24b62c5356d8bf2312327e97b/packages/http-server/src/getHttpConfigFromRequest.ts#L28
    if (status >= 299 || status <= 200) {
     specialHeader = example ? { 'Prefer': `code=${example.status}` } : {};
    } else {
     specialHeader = example ? { 'Prefer': `example=${example.key}` } : {};
    }

    const options = {
      hostname: "localhost",
      port: provider.port,
      path: path,
      method: req.method,
      headers: {
        ...req.headers,
        ...specialHeader,
      }
    };

    const proxy = http.request(options, function (proxy_res) {
      res.writeHead(res.statusCode, res.headers)
      proxy_res.pipe(res, {
        end: true
      });
    });

    req.pipe(proxy, {
      end: true
    });
  }

  console.log("Server running at localhost:4400");
  console.log("Available providers: ", 
    providers.map(
      p => `provider: ${p.name}\nexamples: ${Object.keys(examplesMap[p.name]).join('\n ')}`
    ).join('\n'));

  http.createServer(onRequest).listen(process.env.PORT || 4400);
});

