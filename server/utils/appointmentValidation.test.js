const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidCalendarDate, validateAppointment } = require('./appointmentValidation');

test('validates calendar dates and rejects impossible dates', () => {
  assert.equal(isValidCalendarDate('2026-10-26'), true);
  assert.equal(isValidCalendarDate('2026-02-30'), false);
  assert.equal(isValidCalendarDate('26-10-2026'), false);
});

test('requires valid appointment fields and quantities', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');
  assert.deepEqual(validateAppointment({
    date,
    time: '14:30',
    service: 'Notebook',
    address: 'Rua das Flores, 10',
    quantity: 2,
  }), []);
  assert.ok(validateAppointment({
    date,
    time: '25:90',
    service: 'Notebook',
    address: 'Rua das Flores',
    quantity: 0,
  }).length >= 2);
});

test('validates optional fields while allowing partial edits', () => {
  assert.deepEqual(validateAppointment({ notes: 'Observação atualizada' }, { allowPartial: true }), []);
  assert.ok(validateAppointment({ notes: 'x'.repeat(2001) }, { allowPartial: true }).includes('Observações inválidas'));
});

test('rejects dates in the past', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, '0'),
    String(yesterday.getDate()).padStart(2, '0'),
  ].join('-');
  assert.ok(validateAppointment({ date }, { allowPartial: true }).includes('A data da coleta não pode estar no passado'));
});
