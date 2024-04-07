/**
 * @typedef {import('@readme/openapi-parser').OpenAPIParser} OpenAPIParser
 */
const OpenAPIParser = require("@readme/openapi-parser");

/**
 * @typedef Git
 * @property {string} path - The path to the file containing the openapi specification
 */

/**
 * @typedef {Object} Provider
 * @property {string} name - The name of the provider (must be unique)
 * @property {string} openapiFile - The path to the OpenAPI file
 * @property {Git} git - The git containing repo, file and ref (tag)
 */

/**
 * Create matchers from the OpenAPI specification
 * @param {Provider} param0 - The provider object
 * @returns {Promise<RegExp[]>} - Array of matchers
 */
const createMatchers = async ({ name, openapiFile, git }) => {
  let file = openapiFile;

  if (git) {
    file = `./providers/${name}/${git.path}`;
  }

  const openApi = await OpenAPIParser.validate(file);
  const examplesUrlMap = Object.keys(openApi.paths).map((path) => {
    const mapExamples = Object.keys(openApi.paths[path]).map((attr) => {
      if (![ 'get', 'post', 'put', 'delete', 'patch' ].includes(attr)) return [];
      const method = openApi.paths[path][attr];

      const examples = Object.keys(method.responses).map((response) => {
        const responseObj = method.responses[response];
        if (!responseObj.content) return [];
        return Object.keys(method.responses[response].content).map((content) => {
          const contentObjs = method.responses[response].content[content];
          if (!contentObjs.examples) return [];
          return Object.keys(contentObjs.examples);
        });
      }).flat(2);

      return examples;
    }).flat(2);

    return mapExamples.reduce((acc, example) => {
      return { ...acc, [path.replace(/{[^}]*}/g, example)]: example };
    }, {})
  }).reduce((a, b) => ({ ...a, ...b }));;

  return {
    [name]: examplesUrlMap,
  }
};

// only run if module is run directly for debugging
// `node match-example.js`
if (require.main === module) {
  const { providers } = require('./fixtures/proxy.json');
  createMatchers(providers[0]).then((matchers) => {
    console.log('matchers: ', matchers);
  });
}

const createExamplesUrlsForProviders = async (providers) => {
  const promises = providers.map(async provider => {
    return await createMatchers(provider);
  });

  const providersMatcher = await Promise.all(promises);
  return providersMatcher.reduce((a, c) => ({...a, ...c}));
};

module.exports = createExamplesUrlsForProviders;
