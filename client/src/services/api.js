export const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:7777').replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const { auth, ...fetchOptions } = options;

  let response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...fetchOptions, headers, credentials: 'include' });
  } catch (error) {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está ativa.');
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (response.ok) throw new Error('Resposta inválida do servidor.');
    data = {};
  }

  if (response.status === 401 && options.auth !== false) {
    window.dispatchEvent(new Event('sice:client-session-expired'));
  }
  if (!response.ok) throw new Error(data.mensagem || data.message || 'Não foi possível concluir a solicitação.');
  return data;
}

export function getTodayDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getMinimumTime(date) {
  if (date !== getTodayDate()) return undefined;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
  return parts;
}
