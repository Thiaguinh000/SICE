const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginUser = async (req, res) => {
  const { email, senha } = req.body || {};

  if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios' });
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET não está configurada');
    return res.status(500).json({ mensagem: 'Autenticação indisponível no momento' });
  }

  try {
    const usuario = await User.findOne({ email: email.trim().toLowerCase() });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    if (!['usuario', 'cliente'].includes(usuario.tipo)) {
      return res.status(403).json({ mensagem: 'Esta conta deve ser acessada pela área administrativa' });
    }

    const token = jwt.sign(
      { userId: usuario._id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

const loginAdminUser = async (req, res) => {
  const { email, senha } = req.body || {};

  if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
    return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios' });
  }

  if (!JWT_SECRET) {
    console.error('JWT_SECRET não está configurada');
    return res.status(500).json({ mensagem: 'Autenticação indisponível no momento' });
  }

  try {
    const usuario = await User.findOne({ email: email.trim().toLowerCase() });
    if (!usuario || !['admin', 'coletor'].includes(usuario.tipo)) {
      return res.status(401).json({ mensagem: 'Credenciais administrativas inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Credenciais administrativas inválidas' });
    }

    const token = jwt.sign(
      { userId: usuario._id, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//Realizar registro
const registerUser = async (req, res) => {
  const { nome, email, senha } = req.body || {};

  try {
    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {
      return res.status(400).json({ mensagem: 'Nome, e-mail e senha são obrigatórios' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const userExistente = await User.findOne({ email: emailNormalizado });
    if (userExistente) {
      return res.status(409).json({ mensagem: 'Usuário já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new User({
      nome: nome.trim(),
      email: emailNormalizado,
      senha: senhaHash,
      tipo: 'usuario',
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ mensagem: 'Usuário já cadastrado' });
    }
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const usuario = await User.findById(req.userId).select('-senha').lean();

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Não foi possível carregar o perfil' });
  }
};

const updateUserProfile = async (req, res) => {
  const { nome, email, senhaAtual, novaSenha } = req.body || {};

  if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ mensagem: 'Nome e e-mail são obrigatórios' });
  }

  const changingPassword = senhaAtual !== undefined || novaSenha !== undefined;
  if (changingPassword && (typeof senhaAtual !== 'string' || !senhaAtual || typeof novaSenha !== 'string' || !novaSenha)) {
    return res.status(400).json({ mensagem: 'Informe a senha atual e a nova senha' });
  }

  try {
    const usuario = await User.findById(req.userId);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    if (changingPassword && !(await bcrypt.compare(senhaAtual, usuario.senha))) {
      return res.status(400).json({ mensagem: 'Senha atual inválida' });
    }

    usuario.nome = nome.trim();
    usuario.email = email.trim().toLowerCase();
    if (changingPassword) usuario.senha = await bcrypt.hash(novaSenha, 10);

    await usuario.save();
    res.json({
      mensagem: 'Dados atualizados com sucesso',
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado' });
    }
    console.error(erro);
    res.status(500).json({ mensagem: 'Não foi possível atualizar os dados da conta' });
  }
};

const deleteUserAccount = async (req, res) => {
  const { senha } = req.body || {};
  if (typeof senha !== 'string' || !senha) {
    return res.status(400).json({ mensagem: 'Informe sua senha para excluir a conta' });
  }

  try {
    const usuario = await User.findById(req.userId);
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    if (!(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    await Appointment.updateMany(
      { client: usuario._id },
      {
        $set: {
          client: null,
          address: '',
        },
        $unset: { notes: '' },
      }
    );
    await User.deleteOne({ _id: usuario._id });

    res.json({ mensagem: 'Conta excluída. O histórico de coletas foi mantido sem dados pessoais.' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Não foi possível excluir a conta' });
  }
};

module.exports = {
  loginUser,
  loginAdminUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
};
