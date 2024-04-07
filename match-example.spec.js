const examplesUrlMap = require('./match-example');
const { providers } = require('./fixtures/proxy.json');

describe('examplesUrlMap', () => {
  it('should create matchers from the OpenAPI specification', async () => {
    const examples = await examplesUrlMap(providers);
    expect(examples["pets-store"]).toEqual({
      "/v1/pets/Not_Found/status": "Not_Found",
      "/v1/pets/Pet/status": "Pet",
      "/v1/pets/foo/status": "foo",
      "/v1/pets/sessions/paid_session": "paid_session",
      "/v1/pets/sessions/pending_session": "pending_session",
    });

    expect(examples["animals"]).toEqual({
      "/animals/first": "first",
      "/animals/second": "second",
    });
  });
});
