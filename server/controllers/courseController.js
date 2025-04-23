const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Get all published courses
exports.getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' })
      .select('title description price thumbnail instructor createdAt')
      .populate('instructor', 'fullName')
      .sort('-createdAt')
      .lean();

    res.json({ courses });
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ error: 'Failed to fetch available courses' });
  }
};

// Get enrolled courses for a user
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id.toString(); // From auth middleware
    console.log("Fetching enrolled courses for user:", userId);

    // First get the user with populated enrolledCourses
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses',
        select: 'title description thumbnail price category instructor enrolledStudents enrollmentDetails',
        match: { status: { $ne: 'draft' } }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Found ${user.enrolledCourses.length} enrolled courses for user`);

    // Convert to plain objects and add progress
    const courses = user.enrolledCourses.map(course => {
      const courseObj = course.toObject();
      
      // Try to find progress details from enrollmentDetails
      let progress = 0;
      if (courseObj.enrollmentDetails && Array.isArray(courseObj.enrollmentDetails)) {
        const enrollmentDetail = courseObj.enrollmentDetails.find(
          detail => detail && detail.student && detail.student.toString() === userId
        );
        if (enrollmentDetail) {
          progress = enrollmentDetail.progress || 0;
        }
      }

      return {
        ...courseObj,
        progress: progress
      };
    });

    res.json({ courses });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled courses', details: error.message });
  }
};

// Get user's dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log("Fetching dashboard stats for user:", userId);

    // Get user data with populated enrolled courses
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get enrolled courses count from user.enrolledCourses
    const enrolledCount = user.enrolledCourses ? user.enrolledCourses.length : 0;
    console.log(`User has ${enrolledCount} enrolled courses`);

    // Get course details to calculate completed lessons
    let completedLessonsCount = 0;
    let totalLearningHours = 0;
    
    if (enrolledCount > 0) {
      // Get all courses where user is enrolled
      const courses = await Course.find({
        _id: { $in: user.enrolledCourses }
      }).select('enrollmentDetails lessons');
      
      // Calculate completed lessons from enrollmentDetails
      courses.forEach(course => {
        if (course.enrollmentDetails && Array.isArray(course.enrollmentDetails)) {
          const userEnrollment = course.enrollmentDetails.find(
            detail => detail && detail.student && detail.student.toString() === userId
          );
          
          if (userEnrollment && userEnrollment.completedLessons) {
            completedLessonsCount += userEnrollment.completedLessons.length;
            // Assuming each lesson is 30 minutes
            totalLearningHours += (userEnrollment.completedLessons.length * 0.5);
          }
        }
      });
    }

    res.json({
      stats: {
        enrolledCourses: enrolledCount,
        completedLessons: completedLessonsCount,
        learningHours: Math.round(totalLearningHours)
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error.message 
    });
  }
};

// Enroll in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Check if course exists and is published
    const course = await Course.findOne({
      _id: courseId,
      status: 'published'
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === userId.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Add student to enrolled list
    course.enrolledStudents.push({
      student: userId,
      progress: 0,
      completedLessons: []
    });

    await course.save();

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
};

// Update lesson progress
exports.updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId, completed } = req.body;
    const userId = req.user._id;

    const course = await Course.findOne({
      _id: courseId,
      'enrolledStudents.student': userId
    });

    if (!course) {
      return res.status(404).json({ error: 'Course or enrollment not found' });
    }

    const enrollment = course.enrolledStudents.find(
      e => e.student.toString() === userId.toString()
    );

    if (completed) {
      // Add to completed lessons if not already completed
      if (!enrollment.completedLessons.some(l => l.lessonId === lessonId)) {
        enrollment.completedLessons.push({
          lessonId,
          completedAt: new Date()
        });
      }
    } else {
      // Remove from completed lessons
      enrollment.completedLessons = enrollment.completedLessons.filter(
        l => l.lessonId !== lessonId
      );
    }

    // Update progress percentage
    enrollment.progress = Math.round(
      (enrollment.completedLessons.length / course.lessons.length) * 100
    );

    await course.save();

    res.json({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update lesson progress' });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    console.log(`Fetching course ${id} for user ${userId}`);

    // First check if user is enrolled in this course
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if course is in user's enrolledCourses
    const isEnrolled = user.enrolledCourses && user.enrolledCourses.some(
      courseId => courseId && courseId.toString() === id
    );
    
    console.log(`User enrollment status for course ${id}: ${isEnrolled}`);
    
    if (!isEnrolled) {
      return res.status(403).json({ 
        error: 'You are not enrolled in this course',
        details: 'Please purchase this course to access its content'
      });
    }

    // Get course details
    const course = await Course.findById(id)
      .populate('instructor', 'fullName email')
      .select('title description video thumbnail instructor lessons');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      error: 'Failed to fetch course details',
      details: error.message
    });
  }
}; 