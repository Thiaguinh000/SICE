const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const loginRateLimit = require('../middleware/loginRateLimit');
const { loginAdminUser, logoutUser } = require('../controllers/userController');
const {
  getDashboard,
  getAppointments,
  getAppointmentDetails,
  updateAppointmentStatus,
  getCollectors,
  assignCollector,
  getUsers,
  getReports,
} = require('../controllers/adminController');
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} = require('../controllers/userController');

const router = express.Router();
const requireStaff = [authMiddleware, roleMiddleware('admin', 'coletor')];
const requireAdmin = [authMiddleware, roleMiddleware('admin')];

router.post('/login', loginRateLimit(), loginAdminUser);
router.post('/logout', logoutUser);
router.get('/account/profile', ...requireStaff, getUserProfile);
router.patch('/account/profile', ...requireStaff, updateUserProfile);
router.delete('/account/profile', ...requireStaff, deleteUserAccount);
router.get('/dashboard', ...requireStaff, getDashboard);
router.get('/appointments', ...requireStaff, getAppointments);
router.get('/collectors', ...requireStaff, getCollectors);
router.get('/appointments/:id', ...requireStaff, getAppointmentDetails);
router.patch('/appointments/:id/status', ...requireStaff, updateAppointmentStatus);
router.patch('/appointments/:id/assignment', ...requireAdmin, assignCollector);
router.get('/users', ...requireAdmin, getUsers);
router.get('/reports', ...requireStaff, getReports);

module.exports = router;
