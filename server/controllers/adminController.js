const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const fs = require('fs').promises;
const path = require('path');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalInstructors, totalPayments] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Course.countDocuments(),
      User.countDocuments({ role: 'instructor' }),
      Payment.countDocuments()
    ]);

    // Calculate total revenue
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    res.json({
      totalUsers,
      totalCourses,
      totalInstructors,
      totalPayments,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user',
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { fullName, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user',
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Check if it's trying to delete an admin
    if (user.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot delete admin users' 
      });
    }
    
    // TODO: If user is an instructor, handle their courses
    if (user.role === 'instructor') {
      // Maybe you want to reassign courses or delete them
      const courses = await Course.find({ instructor: user._id });
      for (const course of courses) {
        // Delete course thumbnails
        if (course.thumbnail) {
          try {
            await fs.unlink(path.join(__dirname, '..', course.thumbnail));
          } catch (err) {
            console.error('Error deleting thumbnail:', err);
          }
        }
        
        // Delete course videos
        if (course.video) {
          try {
            await fs.unlink(path.join(__dirname, '..', course.video));
          } catch (err) {
            console.error('Error deleting video:', err);
          }
        }
      }
      
      // Delete all courses by this instructor
      await Course.deleteMany({ instructor: user._id });
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

// Course Management
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'fullName email')
      .sort('-createdAt');
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses',
      message: error.message
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'fullName email');
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch course',
      message: error.message
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, status } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id, 
      { title, description, price: Number(price), status },
      { new: true, runValidators: true }
    ).populate('instructor', 'fullName email');
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update course',
      message: error.message
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        error: 'Course not found' 
      });
    }
    
    // Delete course files
    if (course.thumbnail) {
      try {
        await fs.unlink(path.join(__dirname, '..', course.thumbnail));
      } catch (err) {
        console.error('Error deleting thumbnail:', err);
      }
    }
    
    if (course.video) {
      try {
        await fs.unlink(path.join(__dirname, '..', course.video));
      } catch (err) {
        console.error('Error deleting video:', err);
      }
    }
    
    // Delete the course
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete course',
      message: error.message
    });
  }
};

// Payment Management
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'fullName email')
      .populate('course', 'title')
      .populate('instructor', 'fullName email')
      .sort('-createdAt');
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
}; 