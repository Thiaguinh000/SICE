const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const loginRateLimit = require('../middleware/loginRateLimit');
const {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  logoutUser,
} = require('../controllers/userController');
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');

//Rotas de login e registro. Aqui também daria pra colocar rotas para exibição do perfil, aluno.
router.post('/login', loginRateLimit(), loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerUser);
router.get('/profile', authMiddleware, getUserProfile);
router.patch('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserAccount);
router.get('/notifications', authMiddleware, getNotifications);
router.patch('/notifications/:id/read', authMiddleware, markNotificationRead);

module.exports = router;
