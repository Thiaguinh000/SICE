const test = require('node:test');
const assert = require('node:assert/strict');
const { getTransitionError } = require('./appointmentStatus');

test('allows only the next collection status', () => {
  assert.equal(getTransitionError('Pendente', 'Aguardando coleta'), null);
  assert.equal(getTransitionError('Pendente', 'Finalizado'), 'Esta transição de status não é permitida');
  assert.equal(getTransitionError('Finalizado', 'Em transporte'), 'Esta transição de status não é permitida');
});

test('requires a valid destination after evaluation', () => {
  assert.equal(
    getTransitionError('Em avaliação', 'Reciclado ou Descartado'),
    'Selecione se o material foi reciclado ou descartado'
  );
  assert.equal(getTransitionError('Em avaliação', 'Reciclado ou Descartado', 'Reciclado'), null);
  assert.equal(getTransitionError('Em avaliação', 'Reciclado ou Descartado', 'Incineração'), 'Destino inválido');
});
