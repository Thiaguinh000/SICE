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

app.use(cors());
app.use(express.json());
app.use('/api', databaseMiddleware);

app.use('/api/users', userRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/api/admin', adminRoutes);

const startServer = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.warn('MongoDB indisponível. O servidor continuará em modo de desenvolvimento, mas as rotas que dependem do banco podem falhar.');
  }

  app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
};

startServer();
