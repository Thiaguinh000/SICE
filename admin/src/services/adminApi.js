const apiBase = `${(process.env.REACT_APP_API_URL || 'http://localhost:7777').replace(/\/$/, '')}/api/admin`;

export async function adminRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...options, headers, credentials: 'include' });
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
    window.dispatchEvent(new Event('sice:admin-session-expired'));
    throw new Error(data.mensagem || 'Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) {
    throw new Error(data.mensagem || 'Não foi possível concluir a solicitação.');
  }

  return data;
}

export async function accountRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${apiBase}/account${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
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
    window.dispatchEvent(new Event('sice:admin-session-expired'));
    throw new Error(data.mensagem || 'Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) {
    throw new Error(data.mensagem || 'Não foi possível concluir a solicitação.');
  }

  return data;
}
