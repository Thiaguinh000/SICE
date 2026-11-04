const test = require('node:test');
const assert = require('node:assert/strict');
const createLoginRateLimit = require('./loginRateLimit');

function makeResponse() {
  const listeners = {};
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    set(name, value) { this.headers[name] = value; return this; },
    json(body) { this.body = body; return this; },
    on(event, listener) { listeners[event] = listener; },
    finish() { listeners.finish?.(); },
  };
}

test('limits repeated attempts from the same IP and provides a retry interval', () => {
  const limiter = createLoginRateLimit({ windowMs: 60000, maxAttempts: 2 });
  const request = { ip: '192.0.2.1' };
  let nextCount = 0;

  limiter(request, makeResponse(), () => { nextCount += 1; });
  limiter(request, makeResponse(), () => { nextCount += 1; });
  const response = makeResponse();
  limiter(request, response, () => { nextCount += 1; });

  assert.equal(nextCount, 2);
  assert.equal(response.statusCode, 429);
  assert.ok(Number(response.headers['Retry-After']) > 0);
});

test('clears failed-attempt count after a successful login response', () => {
  const limiter = createLoginRateLimit({ windowMs: 60000, maxAttempts: 1 });
  const request = { ip: '192.0.2.2' };
  const successResponse = makeResponse();
  limiter(request, successResponse, () => {});
  successResponse.finish();

  let nextCalled = false;
  limiter(request, makeResponse(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});
