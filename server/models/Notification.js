const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  eventKey: { type: String, required: true },
  type: { type: String, enum: ['status', 'reminder'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ user: 1, eventKey: 1 }, { unique: true });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
