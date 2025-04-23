const express = require('express');
const router = express.Router();
const { isAuthenticated, isInstructor } = require('../middleware/auth');
const {
  getDashboardStats,
  getCourses,
  createCourse,
  deleteCourse,
  getEnrollments,
  getCourseById,
  updateCourse
} = require('../controllers/instructorController');

// All routes are prefixed with /api/instructor
router.use(isAuthenticated, isInstructor);

router.get('/stats', getDashboardStats);
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourseById);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.get('/enrollments', getEnrollments);

module.exports = router; 