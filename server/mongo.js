const dns = require('node:dns');
const { DNS_SERVERS, MONGO_URI } = require('./config');
const mongoose = require('mongoose');

if (DNS_SERVERS) {
  const servers = DNS_SERVERS.split(',').map((server) => server.trim());
  if (servers.some((server) => !server)) {
    throw new Error('DNS_SERVERS deve conter endereços DNS separados por vírgulas.');
  }
  dns.setServers(servers);
}

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
