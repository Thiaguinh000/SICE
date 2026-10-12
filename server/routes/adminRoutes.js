const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { loginAdminUser } = require('../controllers/userController');
const {
  getDashboard,
  getAppointments,
  getAppointmentDetails,
  updateAppointmentStatus,
  getUsers,
  getReports,
} = require('../controllers/adminController');

const router = express.Router();
const requireStaff = [authMiddleware, roleMiddleware('admin', 'coletor')];
const requireAdmin = [authMiddleware, roleMiddleware('admin')];

router.post('/login', loginAdminUser);
router.get('/dashboard', ...requireStaff, getDashboard);
router.get('/appointments', ...requireStaff, getAppointments);
router.get('/appointments/:id', ...requireStaff, getAppointmentDetails);
router.patch('/appointments/:id/status', ...requireStaff, updateAppointmentStatus);
router.get('/users', ...requireAdmin, getUsers);
router.get('/reports', ...requireStaff, getReports);

module.exports = router;
