/**
 * @typedef {import('@readme/openapi-parser').OpenAPIParser} OpenAPIParser
 */
const OpenAPIParser = require("@readme/openapi-parser");

/**
 * Create matchers from the OpenAPI specification
 * @param {string} specification - OpenAPI specification
 * @returns {Promise<RegExp[]>} - Array of matchers
 */
const createMatchers = async (specification) => {
  const res = await OpenAPIParser.validate(specification);
  return Object.keys(res.paths).map((path) => {
    const mapExamples = Object.keys(res.paths[path]).map((key) => {
      const method = res.paths[path][key];

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
    })[0].reduce((acc, example) => {
      return { ...acc, [path.replace(/{[^}]*}/g, example)]: example };
    }, {});

    return mapExamples;
  }).reduce((a, b) => ({ ...a, ...b }));
};

// createMatchers('./providers/pets-store/openapi/api.yaml').then((matchers) => {
//   console.log('@@@@@@  matchers: ', matchers);
// });

module.exports = createMatchers;
