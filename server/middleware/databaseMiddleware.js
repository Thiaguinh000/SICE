const mongoose = require('mongoose');

const databaseMiddleware = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensagem: 'Banco de dados indisponível. Tente novamente mais tarde.' });
  }

  next();
};

module.exports = databaseMiddleware;
