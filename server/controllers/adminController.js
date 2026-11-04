const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { getTransitionError, destinations } = require('../utils/appointmentStatus');

const getDashboard = async (req, res) => {
  try {
    const [totalSolicitacoes, statusCounts, reciclados, descartados] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', total: { $sum: 1 } } },
      ]),
      Appointment.countDocuments({ destination: 'Reciclado' }),
      Appointment.countDocuments({ destination: 'Descartado' }),
    ]);

    const porStatus = Object.fromEntries(statusCounts.map(({ _id, total }) => [_id || 'Pendente', total]));
    res.json({
      totalSolicitacoes,
      pendentes: porStatus.Pendente || 0,
      aguardandoColeta: porStatus['Aguardando coleta'] || 0,
      emTransporte: porStatus['Em transporte'] || 0,
      emAvaliacao: porStatus['Em avaliação'] || 0,
      finalizadas: porStatus.Finalizado || 0,
      reciclados,
      descartados,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar o painel administrativo' });
  }
};

const getAppointments = async (req, res) => {
  const filtro = {};
  if (req.query.date) {
    const date = new Date(`${req.query.date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== req.query.date) {
      return res.status(400).json({ mensagem: 'Data de filtro inválida' });
    }
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    filtro.date = { $gte: date, $lt: nextDate };
  }
  if (req.query.assignedCollector) {
    if (!mongoose.isValidObjectId(req.query.assignedCollector)) {
      return res.status(400).json({ mensagem: 'Identificador de coletor inválido' });
    }
    filtro.assignedCollector = req.query.assignedCollector;
  }
  if (req.query.status === 'Pendente') {
    filtro.$or = [{ status: 'Pendente' }, { status: null }];
  } else if (req.query.status) {
    filtro.status = req.query.status;
  }

  try {
    const appointments = await Appointment.find(filtro)
      .sort({ createdAt: -1 })
      .populate('client', 'nome email')
      .populate('assignedCollector', 'nome email')
      .lean();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar as coletas' });
  }
};

const getAppointmentDetails = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensagem: 'Identificador de coleta inválido' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'nome email')
      .populate('assignedCollector', 'nome email')
      .lean();
    if (!appointment) return res.status(404).json({ mensagem: 'Coleta não encontrada' });
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar os detalhes da coleta' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { status, destination, weightKg } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensagem: 'Identificador de coleta inválido' });
  }
  if (typeof status !== 'string' || (destination !== undefined && !destinations.includes(destination))) {
    return res.status(400).json({ mensagem: 'Status ou destino inválido' });
  }
  if (weightKg !== undefined && (!Number.isFinite(Number(weightKg)) || Number(weightKg) <= 0 || Number(weightKg) > 100000)) {
    return res.status(400).json({ mensagem: 'Informe um peso real maior que zero e menor que 100000 kg' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ mensagem: 'Coleta não encontrada' });

    const previousStatus = appointment.status || 'Pendente';
    const transitionError = getTransitionError(previousStatus, status, destination);
    if (transitionError) return res.status(400).json({ mensagem: transitionError });
    if (status === 'Reciclado ou Descartado' && weightKg === undefined) {
      return res.status(400).json({ mensagem: 'Registre o peso medido pela equipe para concluir a avaliação' });
    }

    const filter = { _id: appointment._id };
    if (previousStatus === 'Pendente') {
      filter.$or = [{ status: 'Pendente' }, { status: null }];
    } else {
      filter.status = previousStatus;
    }
    const update = { status };
    if (status === 'Reciclado ou Descartado') {
      update.destination = destination;
      update.weightKg = Number(weightKg);
    }

    const updatedAppointment = await Appointment.findOneAndUpdate(
      filter,
      {
        $set: update,
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
            changedBy: req.userId,
            ...(status === 'Reciclado ou Descartado' ? { destination, weightKg: Number(weightKg) } : {}),
          },
        },
      },
      { new: true, runValidators: true }
    )
      .populate('client', 'nome email')
      .populate('assignedCollector', 'nome email');
    if (!updatedAppointment) {
      return res.status(409).json({ mensagem: 'A coleta foi atualizada por outra pessoa. Recarregue os dados.' });
    }

    res.json({ mensagem: 'Status da coleta atualizado com sucesso', agendamento: updatedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível atualizar o status da coleta' });
  }
};

const getCollectors = async (req, res) => {
  try {
    const collectors = await User.find({ tipo: 'coletor' })
      .select('nome email')
      .sort({ nome: 1 })
      .lean();
    res.json(collectors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar a equipe de coleta' });
  }
};

const assignCollector = async (req, res) => {
  const { collectorId } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id)
    || (collectorId !== null && !mongoose.isValidObjectId(collectorId))) {
    return res.status(400).json({ mensagem: 'Identificador de coleta ou coletor inválido' });
  }

  try {
    if (collectorId && !await User.exists({ _id: collectorId, tipo: 'coletor' })) {
      return res.status(404).json({ mensagem: 'Coletor não encontrado' });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { assignedCollector: collectorId || null } },
      { new: true, runValidators: true }
    )
      .populate('assignedCollector', 'nome email')
      .lean();
    if (!appointment) return res.status(404).json({ mensagem: 'Coleta não encontrada' });
    res.json({ mensagem: 'Responsável pela coleta atualizado', assignedCollector: appointment.assignedCollector });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível atribuir o coletor' });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users, counts] = await Promise.all([
      User.find().select('nome email tipo createdAt').sort({ createdAt: -1 }).lean(),
      Appointment.aggregate([{ $group: { _id: '$client', total: { $sum: 1 } } }]),
    ]);
    const countByUser = new Map(counts.map(({ _id, total }) => [String(_id), total]));
    res.json(users.map((user) => ({
      ...user,
      totalColetas: countByUser.get(String(user._id)) || 0,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar os usuários' });
  }
};

const getReports = async (req, res) => {
  try {
    const [porMaterial, porStatus, porMes, porDestino] = await Promise.all([
      Appointment.aggregate([
        {
          $group: {
            _id: '$service',
            solicitacoes: { $sum: 1 },
            itens: { $sum: { $ifNull: ['$quantity', 1] } },
            pesoKg: { $sum: { $ifNull: ['$weightKg', 0] } },
          },
        },
        { $sort: { solicitacoes: -1, _id: 1 } },
      ]),
      Appointment.aggregate([
        { $group: { _id: { $ifNull: ['$status', 'Pendente'] }, total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: { $ifNull: ['$createdAt', '$date'] } } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 12 },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$destination', 'Sem destino'] },
            coletas: { $sum: 1 },
            pesoKg: { $sum: { $ifNull: ['$weightKg', 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ porMaterial, porStatus, porMes, porDestino });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar os relatórios' });
  }
};

module.exports = {
  getDashboard,
  getAppointments,
  getAppointmentDetails,
  updateAppointmentStatus,
  getCollectors,
  assignCollector,
  getUsers,
  getReports,
};
