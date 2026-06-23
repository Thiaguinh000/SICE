const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: {type: String, required: true,},
  email: {type: String, required: true, unique: true,},
  senha: {type: String, required: true,},
  tipo: {type: String, enum: ['cliente', 'funcionario', 'admin'], default: 'cliente',},
  telefone: {type: String},
  endereco: {
    cep: {type: String},
    rua: {type: String},
    numero: {type: String},
    complemento: {type: String},
    bairro: {type: String},
    cidade: {type: String},
    estado: {type: String}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
