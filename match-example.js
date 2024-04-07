/**
 * @typedef {import('@readme/openapi-parser').OpenAPIParser} OpenAPIParser
 */
const OpenAPIParser = require("@readme/openapi-parser");

/**
 * @typedef {Object} Provider
 * @property {string} name - The name of the provider
 * @property {string} openapiFile - The path to the OpenAPI file
 */

/**
 * Create matchers from the OpenAPI specification
 * @param {Provider} param0 - The provider object
 * @returns {Promise<RegExp[]>} - Array of matchers
 */
const createMatchers = async ({ name, openapiFile }) => {
  const openApi = await OpenAPIParser.validate(openapiFile);
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

// createMatchers('./providers/pets-store/openapi/api.yaml').then((matchers) => {
//   console.log('@@@@@@  matchers: ', matchers);
// });


const createExamplesUrlsForProviders = async (providers) => {
  const promises = providers.map(async provider => {
    return await createMatchers(provider);
  });

  const providersMatcher = await Promise.all(promises);
  return providersMatcher.reduce((a, c) => ({...a, ...c}));
};

module.exports = createExamplesUrlsForProviders;
