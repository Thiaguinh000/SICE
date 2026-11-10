const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { validateAppointment } = require('../utils/appointmentValidation');

// Criar novo agendamento
const createAppointment = async (req, res) => {
  if (!['usuario', 'cliente'].includes(req.userTipo)) {
    return res.status(403).json({ mensagem: 'Somente clientes podem solicitar uma coleta' });
  }

  const { date, time, service, brand, model, quantity, condition, address, notes } = req.body || {};
  const validationErrors = validateAppointment({ date, time, service, brand, model, quantity, condition, address, notes });
  if (validationErrors.length) return res.status(400).json({ mensagem: validationErrors.join('. ') });

  try {
    const newAppointment = new Appointment({
      client: req.userId,
      date,
      time,
      service,
      brand,
      model,
      quantity,
      condition,
      address,
      notes,
      statusHistory: [{ status: 'Pendente', changedBy: req.userId }],
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao solicitar coleta' });
  }
};

// Listar agendamentos, permitindo o filtro de status (agendamento pendente, concluido etc)
const getAppointments = async (req, res) => {
  const userId = req.userId;
  const userTipo = req.userTipo;
  const { status } = req.query;

  const filtro = {};
  if (userTipo === 'usuario' || userTipo === 'cliente') {
    filtro.client = userId;
  } else if (!['admin', 'coletor'].includes(userTipo)) {
    return res.status(403).json({ mensagem: 'Você não possui permissão para consultar coletas' });
  }
  if (status) filtro.status = status;

  try {
    const appointmentsQuery = Appointment.find(filtro).sort({ date: 1 }).populate('client', 'nome email');
    if (userTipo === 'usuario' || userTipo === 'cliente') appointmentsQuery.select('-adminNotes -assignedCollectorName');
    const agendamentos = await appointmentsQuery;
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar coletas' });
  }
};

// Buscar agendamento por ID
const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ mensagem: 'Identificador de coleta inválido' });
  }
  if (!['usuario', 'cliente', 'admin', 'coletor'].includes(req.userTipo)) {
    return res.status(403).json({ mensagem: 'Você não possui permissão para consultar esta coleta' });
  }

  try {
    const filtro = { _id: id };
    if (req.userTipo === 'usuario' || req.userTipo === 'cliente') {
      filtro.client = req.userId;
    }

    const appointmentQuery = Appointment.findOne(filtro).populate('client', 'nome email');
    if (req.userTipo === 'usuario' || req.userTipo === 'cliente') appointmentQuery.select('-adminNotes -assignedCollectorName');
    const appointment = await appointmentQuery;

    if (!appointment) {
      return res.status(404).json({ message: 'Coleta não encontrada' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar coleta' });
  }
};

// Editar agendamento
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ mensagem: 'Identificador de coleta inválido' });
  }
  const { date, time, service, brand, model, quantity, condition, address, notes, status, destination } = req.body || {};
  const validationErrors = validateAppointment(
    { date, time, service, brand, model, quantity, condition, address, notes },
    { allowPartial: true }
  );
  if (validationErrors.length) return res.status(400).json({ mensagem: validationErrors.join('. ') });
  if (!['date', 'time', 'service', 'brand', 'model', 'quantity', 'condition', 'address', 'notes']
    .some((field) => req.body?.[field] !== undefined)) {
    return res.status(400).json({ mensagem: 'Informe ao menos um campo para atualizar' });
  }

  if (!['usuario', 'cliente'].includes(req.userTipo)) {
    return res.status(403).json({ mensagem: 'Use o fluxo administrativo para atualizar uma coleta' });
  }

  try {
    const filtro = { _id: id, client: req.userId };
    if (status !== undefined || destination !== undefined) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para alterar o status ou o destino da coleta' });
    }

    const appointment = await Appointment.findOne(filtro).select('-adminNotes -assignedCollectorName');

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Coleta não encontrada' });
    }
    if ((appointment.status || 'Pendente') !== 'Pendente') {
      return res.status(403).json({ mensagem: 'A coleta não pode mais ser editada depois de confirmada' });
    }

    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (service !== undefined) appointment.service = service.trim();
    if (brand !== undefined) appointment.brand = brand.trim();
    if (model !== undefined) appointment.model = model.trim();
    if (quantity !== undefined) appointment.quantity = Number(quantity);
    if (condition !== undefined) appointment.condition = condition.trim();
    if (address !== undefined) appointment.address = address.trim();
    if (notes !== undefined) appointment.notes = notes.trim();
    await appointment.save();

    res.json({ mensagem: 'Coleta atualizada com sucesso', agendamento: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar coleta' });
  }
};

// Deletar agendamento
const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ mensagem: 'Identificador de coleta inválido' });
  }
  if (!['usuario', 'cliente'].includes(req.userTipo)) {
    return res.status(403).json({ mensagem: 'Você não possui permissão para cancelar esta coleta' });
  }

  try {
    const filtro = { _id: id, client: req.userId };
    const appointment = await Appointment.findOne(filtro);

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Coleta não encontrada' });
    }
    if ((appointment.status || 'Pendente') !== 'Pendente') {
      return res.status(403).json({ mensagem: 'A coleta não pode mais ser cancelada depois de confirmada' });
    }

    const deletedAppointment = await Appointment.findOneAndDelete({
      ...filtro,
      $or: [{ status: 'Pendente' }, { status: null }],
    });
    if (!deletedAppointment) {
      return res.status(409).json({ mensagem: 'A coleta foi atualizada. Recarregue os dados e tente novamente.' });
    }
    await Notification.deleteMany({ appointment: deletedAppointment._id });

    res.json({ mensagem: 'Coleta cancelada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao cancelar coleta' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
