const test = require('node:test');
const assert = require('node:assert/strict');
const roleMiddleware = require('./roleMiddleware');

test('allows permitted staff roles', () => {
  let nextCalled = false;
  roleMiddleware('admin', 'coletor')(
    { userTipo: 'coletor' },
    {},
    () => { nextCalled = true; }
  );
  assert.equal(nextCalled, true);
});

test('rejects a regular user', () => {
  let nextCalled = false;
  let statusCode;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  };
  roleMiddleware('admin')({ userTipo: 'usuario' }, response, () => { nextCalled = true; });
  assert.equal(statusCode, 403);
  assert.equal(nextCalled, false);
});
