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
 * @typedef {import('./routing').createMatchers} createMatchers
 */
const createMatchers = require('./match-example.js');

const { providers } = proxyConfig;

/**
 * @returns {Promise<{[key: string]: {[key: string]: string}}>}
 */
const cacheMatchers = async () => {
  const promises = providers.map(async provider => {
    const matchers = await createMatchers(provider.openapiFile);

    return {
      [provider.name]: matchers,
    };
  });

  const providersMatcher = await Promise.all(promises);
  return providersMatcher.reduce((a, c) => ({...a, ...c}));
}

cacheMatchers().then((examplesMap) => {
  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  async function onRequest(req, res) {
    console.log('serve: ' + req.url);

    const [,providerName,] = req.url.split('/')
    const provider = providers.find(p => p.name === providerName);
    if (!provider) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`Provider ${providerName} not found`);
      return;
    }

    const providerExamples = examplesMap[providerName] || {};
    const [,pathWithoutProviderName] = req.url.split(providerName);
    const preferedExample = providerExamples[pathWithoutProviderName];

    const specialHeader = preferedExample ? { 'Prefer': `example=${preferedExample}` } : {};

    const options = {
      hostname: provider.hostname,
      port: provider.port,
      path: req.url.replace(`/${provider.name}`, ''),
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

  http.createServer(onRequest).listen(4400);
});

