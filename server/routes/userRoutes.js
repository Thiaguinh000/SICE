const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} = require('../controllers/userController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', authMiddleware, getUserProfile);
router.patch('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserAccount);

module.exports = router;
