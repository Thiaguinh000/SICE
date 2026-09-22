const { MONGO_URI } = require('./config');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error.message);
    return false;
  }
};

module.exports = connectDB;
