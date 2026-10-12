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
  if (req.query.status === 'Pendente') {
    filtro.$or = [{ status: 'Pendente' }, { status: null }];
  } else if (req.query.status) {
    filtro.status = req.query.status;
  }

  try {
    const appointments = await Appointment.find(filtro)
      .sort({ createdAt: -1 })
      .populate('client', 'nome email')
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
      .lean();
    if (!appointment) return res.status(404).json({ mensagem: 'Coleta não encontrada' });
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível carregar os detalhes da coleta' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { status, destination } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensagem: 'Identificador de coleta inválido' });
  }
  if (typeof status !== 'string' || (destination !== undefined && !destinations.includes(destination))) {
    return res.status(400).json({ mensagem: 'Status ou destino inválido' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ mensagem: 'Coleta não encontrada' });

    const previousStatus = appointment.status || 'Pendente';
    const transitionError = getTransitionError(previousStatus, status, destination);
    if (transitionError) return res.status(400).json({ mensagem: transitionError });

    const filter = { _id: appointment._id };
    if (previousStatus === 'Pendente') {
      filter.$or = [{ status: 'Pendente' }, { status: null }];
    } else {
      filter.status = previousStatus;
    }
    const update = { status };
    if (status === 'Reciclado ou Descartado') update.destination = destination;

    const updatedAppointment = await Appointment.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true }
    ).populate('client', 'nome email');
    if (!updatedAppointment) {
      return res.status(409).json({ mensagem: 'A coleta foi atualizada por outra pessoa. Recarregue os dados.' });
    }

    res.json({ mensagem: 'Status da coleta atualizado com sucesso', agendamento: updatedAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Não foi possível atualizar o status da coleta' });
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
    const [porMaterial, porStatus, porMes] = await Promise.all([
      Appointment.aggregate([
        { $group: { _id: '$service', solicitacoes: { $sum: 1 }, itens: { $sum: { $ifNull: ['$quantity', 1] } } } },
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
    ]);
    res.json({ porMaterial, porStatus, porMes });
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
  getUsers,
  getReports,
};
