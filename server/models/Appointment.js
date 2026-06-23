const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  date: { type: Date, required: true},
  service: { type: String }, // Mantido opcional para compatibilidade inicial
  items: [{
    category: { 
      type: String, 
      enum: ['computadores_monitores', 'celulares_tablets', 'eletrodomesticos_grandes', 'eletroportateis', 'pilhas_baterias', 'cabos_placas', 'outros'], 
      required: true 
    },
    quantity: { type: Number, default: 1 },
    description: String
  }],
  estimatedVolume: { 
    type: String, 
    enum: ['leve', 'medio', 'pesado'], 
    default: 'leve' 
  },
  collectionAddress: {
    cep: {type: String},
    rua: {type: String},
    numero: {type: String},
    complemento: {type: String},
    bairro: {type: String},
    cidade: {type: String},
    estado: {type: String}
  },
  notes: String,
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'em_rota', 'coletado', 'cancelado'],
    default: 'pendente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
