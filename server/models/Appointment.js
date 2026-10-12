const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  date: { type: Date, required: true},
  time: { type: String, required: true},
  service: {type: String, required: true}, // material
  brand: String,
  model: String,
  quantity: { type: Number, default: 1 },
  condition: String,
  address: { type: String, required: true },
  notes: String,
  status: {
    type: String,
    enum: ['Pendente', 'Aguardando coleta', 'Em transporte', 'Em avaliação', 'Reciclado ou Descartado', 'Finalizado'],
    default: 'Pendente'
  },
  destination: { type: String, enum: ['Reciclado', 'Descartado'] }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
