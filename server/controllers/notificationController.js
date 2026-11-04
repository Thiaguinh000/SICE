const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

function saoPauloDate(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function synchronizeNotifications(userId) {
  const appointments = await Appointment.find({ client: userId })
    .select('date time service status statusHistory')
    .lean();

  const today = saoPauloDate(new Date());
  const [year, month, day] = today.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  const operations = [];
  const reminderKeys = [];

  appointments.forEach((appointment) => {
    (appointment.statusHistory || []).forEach((event) => {
      if (!event._id) return;
      operations.push({
        updateOne: {
          filter: { user: userId, eventKey: `status-${appointment._id}-${event._id}` },
          update: {
            $setOnInsert: {
              user: userId,
              appointment: appointment._id,
              eventKey: `status-${appointment._id}-${event._id}`,
              type: 'status',
              title: 'Atualização da coleta',
              message: `A coleta de ${appointment.service} está agora: ${event.status}.`,
            },
          },
          upsert: true,
        },
      });
    });

    const appointmentDate = appointment.date.toISOString().slice(0, 10);
    if (['Pendente', 'Aguardando coleta'].includes(appointment.status || 'Pendente')
      && (appointmentDate === today || appointmentDate === tomorrow)) {
      const eventKey = `reminder-${appointment._id}-${appointmentDate}`;
      reminderKeys.push(eventKey);
      operations.push({
        updateOne: {
          filter: { user: userId, eventKey },
          update: {
            $setOnInsert: {
              user: userId,
              appointment: appointment._id,
              eventKey,
              type: 'reminder',
              title: 'Lembrete de coleta',
              message: `Sua coleta de ${appointment.service} está agendada para ${appointmentDate} às ${appointment.time}.`,
            },
          },
          upsert: true,
        },
      });
    }
  });

  if (appointments.length) {
    await Notification.deleteMany({
      user: userId,
      type: 'reminder',
      appointment: { $in: appointments.map(({ _id }) => _id) },
      eventKey: { $nin: reminderKeys },
    });
  }

  if (operations.length) {
    try {
      await Notification.bulkWrite(operations, { ordered: false });
    } catch (error) {
      const writeErrors = error.writeErrors || error.result?.getWriteErrors?.() || [];
      if (error.code !== 11000
        && (!writeErrors.length || writeErrors.some(({ code }) => code !== 11000))) throw error;
    }
  }
}

const getNotifications = async (req, res) => {
  try {
    await synchronizeNotifications(req.userId);
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('appointment', 'service date time status')
      .lean();
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar as notificações' });
  }
};

const markNotificationRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensagem: 'Identificador de notificação inválido' });
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { readAt: new Date() } },
      { new: true }
    ).lean();
    if (!notification) return res.status(404).json({ mensagem: 'Notificação não encontrada' });
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível atualizar a notificação' });
  }
};

module.exports = { getNotifications, markNotificationRead };
