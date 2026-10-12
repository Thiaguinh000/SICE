const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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


module.exports = {
  loginUser,
  loginAdminUser,
  registerUser,
};
