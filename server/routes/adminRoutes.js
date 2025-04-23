const express = require('express');
const router = express.Router();
const { isAuthenticated, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAllPayments
} = require('../controllers/adminController');

// All routes are prefixed with /api/admin
// Middleware to check if user is admin
router.use(isAuthenticated, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Course Management
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Payment Management
router.get('/payments', getAllPayments);

module.exports = router; 