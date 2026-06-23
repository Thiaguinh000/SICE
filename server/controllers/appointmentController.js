const Appointment = require('../models/Appointment');

// Criar novo agendamento de coleta
const createAppointment = async (req, res) => {
  const { date, service, items, estimatedVolume, collectionAddress, notes } = req.body;

  try {
    const newAppointment = new Appointment({
      client: req.userId,
      date,
      service, // Mantido opcional
      items,
      estimatedVolume,
      collectionAddress,
      notes,
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar agendamento de coleta' });
  }
};

// Listar agendamentos com paginação/filtros, permitindo staff ver tudo
const getAppointments = async (req, res) => {
  const isStaff = req.userTipo === 'funcionario' || req.userTipo === 'admin';
  const { status } = req.query;

  // Se for cliente, vê apenas os dele. Se for staff, vê todos
  const filtro = isStaff ? {} : { client: req.userId };
  
  if (status) {
    filtro.status = status;
  }

  try {
    const agendamentos = await Appointment.find(filtro)
      .populate('client', 'nome email telefone endereco')
      .sort({ date: 1 });
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos de coleta' });
  }
};

// Buscar agendamento por ID
const getAppointmentById = async (req, res) => {
  const { id } = req.params;
  const isStaff = req.userTipo === 'funcionario' || req.userTipo === 'admin';

  try {
    const query = isStaff ? { _id: id } : { _id: id, client: req.userId };
    const appointment = await Appointment.findOne(query).populate('client', 'nome email telefone endereco');

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar agendamento de coleta' });
  }
};

// Editar agendamento (doador edita dados se pendente, staff atualiza status e dados)
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const isStaff = req.userTipo === 'funcionario' || req.userTipo === 'admin';
  const { date, service, items, estimatedVolume, collectionAddress, notes, status } = req.body;

  try {
    const query = isStaff ? { _id: id } : { _id: id, client: req.userId };
    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    // Regras de negócio para edição
    if (!isStaff) {
      // Doador comum só edita se estiver pendente
      if (appointment.status !== 'pendente') {
        return res.status(400).json({ mensagem: 'Não é possível editar um agendamento que já foi confirmado ou recolhido.' });
      }
      
      if (date) appointment.date = date;
      if (service) appointment.service = service;
      if (items) appointment.items = items;
      if (estimatedVolume) appointment.estimatedVolume = estimatedVolume;
      if (collectionAddress) appointment.collectionAddress = collectionAddress;
      if (notes) appointment.notes = notes;
    } else {
      // Funcionário ou admin pode atualizar qualquer campo e o status
      if (date) appointment.date = date;
      if (service) appointment.service = service;
      if (items) appointment.items = items;
      if (estimatedVolume) appointment.estimatedVolume = estimatedVolume;
      if (collectionAddress) appointment.collectionAddress = collectionAddress;
      if (notes) appointment.notes = notes;
      if (status) appointment.status = status;
    }

    await appointment.save();
    res.json({ mensagem: 'Agendamento atualizado com sucesso', agendamento: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar agendamento de coleta' });
  }
};

// Deletar agendamento (apenas se pendente, ou staff livremente)
const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const isStaff = req.userTipo === 'funcionario' || req.userTipo === 'admin';

  try {
    const query = isStaff ? { _id: id } : { _id: id, client: req.userId };
    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ mensagem: 'Agendamento não encontrado' });
    }

    if (!isStaff && appointment.status !== 'pendente') {
      return res.status(400).json({ mensagem: 'Não é possível excluir um agendamento já confirmado ou recolhido.' });
    }

    await Appointment.deleteOne({ _id: id });
    res.json({ mensagem: 'Agendamento deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao deletar agendamento de coleta' });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
