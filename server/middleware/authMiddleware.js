
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

function getSessionToken(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookieName = req.baseUrl === '/api/admin' ? 'sice_admin_session' : 'sice_client_session';
  const sessionCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`));
  if (sessionCookie) return sessionCookie.slice(`${cookieName}=`.length);

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice('Bearer '.length);
  return null;
}

const authMiddleware = async (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(503).json({ mensagem: 'Autenticação indisponível no momento' });
  }

  const token = getSessionToken(req);
  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await User.findById(decoded.userId).select('tipo').lean();
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Sessão inválida. Faça login novamente.' });
    }
    req.userId = usuario._id;
    req.userTipo = usuario.tipo;
    res.set('Cache-Control', 'no-store');
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'CastError') {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }
    console.error(error);
    return res.status(500).json({ mensagem: 'Não foi possível validar a sessão' });
  }
};

module.exports = authMiddleware;
