const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.userTipo)) {
    return res.status(403).json({ mensagem: 'Você não possui permissão para acessar esta área' });
  }

  next();
};

module.exports = roleMiddleware;
