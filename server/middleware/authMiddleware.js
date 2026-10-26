
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await User.findById(decoded.userId).select('tipo').lean();
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Sessão inválida. Faça login novamente.' });
    }
    req.userId = usuario._id;
    req.userTipo = usuario.tipo;
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
