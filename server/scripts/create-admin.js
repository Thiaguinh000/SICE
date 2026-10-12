require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../mongo');
const User = require('../models/User');

const createAdmin = async () => {
  const nome = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;

  if (!nome || !email || !senha) {
    throw new Error('Configure ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no arquivo .env.');
  }
  if (senha.length < 8) {
    throw new Error('ADMIN_PASSWORD deve possuir pelo menos 8 caracteres.');
  }

  if (!await connectDB()) {
    throw new Error('Não foi possível conectar ao MongoDB. Verifique MONGO_URI.');
  }
  if (await User.exists({ email })) {
    throw new Error('Já existe uma conta com esse e-mail; nenhum usuário foi alterado.');
  }

  await User.create({
    nome,
    email,
    senha: await bcrypt.hash(senha, 12),
    tipo: 'admin',
  });
  console.log(`Administrador criado para ${email}. Remova ADMIN_PASSWORD do .env.`);
};

createAdmin()
  .catch((error) => {
    console.error('Não foi possível criar o administrador:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
