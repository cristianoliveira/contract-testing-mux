const examplesUrlMap = require('./match-example');
const { providers } = require('./fixtures/proxy.json');

describe('examplesUrlMap', () => {
  it('creates a map of examples by provider with provider name as key', async () => {
    const examples = await examplesUrlMap(providers);
    expect(examples["pets-store"]).toEqual({
      "/v1/pets/Not_Found/status": {
        key: "Not_Found",
        status: "404",
      },
      "/v1/pets/Pet/status": {
        key: "Pet",
        status: "200",
      },
      "/v1/pets/foo/status": {
        key: "foo",
        status: "200",
      },
      "/v1/pets/sessions/paid_session": {
        key: "paid_session",
        status: "200",
      },
      "/v1/pets/sessions/pending_session": {
        key: "pending_session",
        status: "200",
      },
    });

    expect(examples["animals"]).toEqual({
      "/animals/first": {
        key: "first",
        status: "200",
      },
      "/animals/second": {
        key: "second",
        status: "200",
      }
    });
  });
});
