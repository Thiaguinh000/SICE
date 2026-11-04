const MAX_TEXT_LENGTH = 500;
const MAX_NOTES_LENGTH = 2000;

function isValidCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateAppointment(input, { allowPartial = false } = {}) {
  const errors = [];
  const requiredFields = ['date', 'time', 'service', 'address'];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return ['Dados da coleta inválidos'];
  }

  if (!allowPartial) {
    requiredFields.forEach((field) => {
      if (typeof input[field] !== 'string' || !input[field].trim()) {
        errors.push(`${field} é obrigatório`);
      }
    });
  }

  let isToday = false;
  if (input.date !== undefined) {
    if (!isValidCalendarDate(input.date)) {
      errors.push('Data inválida');
    } else {
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      if (input.date < today) errors.push('A data da coleta não pode estar no passado');
      isToday = input.date === today;
    }
  }

  if (input.time !== undefined && (typeof input.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time))) {
    errors.push('Horário inválido');
  } else if (isToday && typeof input.time === 'string') {
    const now = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date());
    if (input.time <= now) errors.push('O horário da coleta não pode estar no passado');
  }
  if (input.service !== undefined && (typeof input.service !== 'string' || !input.service.trim() || input.service.length > 100)) {
    errors.push('Material inválido');
  }
  if (input.address !== undefined && (typeof input.address !== 'string' || !input.address.trim() || input.address.length > MAX_TEXT_LENGTH)) {
    errors.push('Endereço inválido');
  }
  ['brand', 'model', 'condition'].forEach((field) => {
    if (input[field] !== undefined && (typeof input[field] !== 'string' || input[field].length > 100)) {
      errors.push(`${field} inválido`);
    }
  });
  if (input.notes !== undefined && (typeof input.notes !== 'string' || input.notes.length > MAX_NOTES_LENGTH)) {
    errors.push('Observações inválidas');
  }
  if (input.quantity !== undefined) {
    const quantity = Number(input.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      errors.push('Quantidade deve ser um número inteiro entre 1 e 10000');
    }
  }

  return errors;
}

module.exports = { isValidCalendarDate, validateAppointment };
