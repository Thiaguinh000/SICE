const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pendente', 'Aguardando coleta', 'Em transporte', 'Em avaliação', 'Reciclado ou Descartado', 'Finalizado'],
    required: true,
  },
  changedAt: { type: Date, default: Date.now, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  destination: { type: String, enum: ['Reciclado', 'Descartado'] },
  weightKg: { type: Number, min: 0 },
});

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
  assignedCollector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedCollectorName: { type: String, default: '', maxlength: 120 },
  date: { type: Date, required: true},
  time: { type: String, required: true},
  service: {type: String, required: true}, // material
  brand: String,
  model: String,
  quantity: { type: Number, default: 1 },
  condition: String,
  address: { type: String, default: ''},
  notes: String,
  adminNotes: { type: String, default: '', maxlength: 2000 },
  reportFinalizedAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['Pendente', 'Aguardando coleta', 'Em transporte', 'Em avaliação', 'Reciclado ou Descartado', 'Finalizado'],
    default: 'Pendente'
  },
  destination: { type: String, enum: ['Reciclado', 'Descartado'] },
  weightKg: { type: Number, min: 0 },
  statusHistory: { type: [statusHistorySchema], default: [] },
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
