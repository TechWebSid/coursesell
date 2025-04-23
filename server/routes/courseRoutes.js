const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  getAvailableCourses,
  getEnrolledCourses,
  getDashboardStats,
  enrollInCourse,
  updateLessonProgress,
  getCourseById
} = require('../controllers/courseController');

// Public routes
router.get('/available', getAvailableCourses);

// Protected routes
router.use(isAuthenticated);
router.get('/enrolled', getEnrolledCourses);
router.get('/dashboard-stats', getDashboardStats);
router.post('/enroll', enrollInCourse);
router.post('/progress', updateLessonProgress);
router.get('/:id', getCourseById);

module.exports = router; 