const apiBase = `${(process.env.REACT_APP_API_URL || 'http://localhost:7777').replace(/\/$/, '')}/api/admin`;
const tokenKey = 'adminToken';

export function getTokenPayload(token = localStorage.getItem(tokenKey)) {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(
      atob(base64)
        .split('')
        .map((character) => `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    ));
  } catch (error) {
    return null;
  }
}

export function isValidToken(token) {
  const payload = getTokenPayload(token);
  return Boolean(payload && (!payload.exp || payload.exp * 1000 > Date.now()));
}

export async function adminRequest(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...options, headers });
  } catch (error) {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está ativa.');
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    if (response.ok) throw new Error('Resposta inválida do servidor.');
  }

  if (response.status === 401) {
    localStorage.removeItem(tokenKey);
    window.dispatchEvent(new Event('sice:admin-session-expired'));
    throw new Error(data.mensagem || 'Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) {
    throw new Error(data.mensagem || 'Não foi possível concluir a solicitação.');
  }

  return data;
}

export { tokenKey };
