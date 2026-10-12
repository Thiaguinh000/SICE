const transitions = {
  Pendente: ['Aguardando coleta'],
  'Aguardando coleta': ['Em transporte'],
  'Em transporte': ['Em avaliação'],
  'Em avaliação': ['Reciclado ou Descartado'],
  'Reciclado ou Descartado': ['Finalizado'],
  Finalizado: [],
};

const destinations = ['Reciclado', 'Descartado'];

function getTransitionError(currentStatus, nextStatus, destination) {
  if (!Object.prototype.hasOwnProperty.call(transitions, currentStatus)) {
    return 'A coleta possui um status inválido';
  }
  if (!transitions[currentStatus].includes(nextStatus)) {
    return 'Esta transição de status não é permitida';
  }
  if (nextStatus === 'Reciclado ou Descartado') {
    if (destination === undefined) return 'Selecione se o material foi reciclado ou descartado';
    if (!destinations.includes(destination)) return 'Destino inválido';
  } else if (destination !== undefined) {
    return 'O destino só pode ser informado ao registrar o resultado da avaliação';
  }

  return null;
}

module.exports = { getTransitionError, transitions, destinations };
