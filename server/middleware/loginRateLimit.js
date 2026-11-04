function createLoginRateLimit({ windowMs = 15 * 60 * 1000, maxAttempts = 5 } = {}) {
  const attemptsByIp = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const current = attemptsByIp.get(ip);
    const attempts = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    if (attempts.count >= maxAttempts) {
      res.set('Retry-After', String(Math.ceil((attempts.resetAt - now) / 1000)));
      return res.status(429).json({ mensagem: 'Muitas tentativas de acesso. Aguarde antes de tentar novamente.' });
    }

    attempts.count += 1;
    attemptsByIp.set(ip, attempts);
    res.on('finish', () => {
      if (res.statusCode < 400) attemptsByIp.delete(ip);
    });
    return next();
  };
}

module.exports = createLoginRateLimit;
