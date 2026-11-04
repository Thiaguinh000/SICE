// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const databaseMiddleware = require('./middleware/databaseMiddleware');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { PORT } = require('./config');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não autorizada pela política CORS'));
  },
}));
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'DENY');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '100kb' }));
app.use('/api', databaseMiddleware);

app.use('/api/users', userRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use((req, res) => res.status(404).json({ mensagem: 'Rota não encontrada' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.message === 'Origem não autorizada pela política CORS') {
    return res.status(403).json({ mensagem: error.message });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'A solicitação excede o tamanho permitido' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'Corpo JSON inválido' });
  }
  console.error(error);
  return res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

const startServer = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn('MongoDB indisponível. O servidor continuará em modo de desenvolvimento, mas as rotas que dependem do banco podem falhar.');
  }

  app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
};

startServer();
