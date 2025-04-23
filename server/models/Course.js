const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide course price']
  },
  thumbnail: {
    type: String
  },
  video: {
    type: String,
    required: [true, 'Please upload a course video']
  },
  category: {
    type: String,
    enum: ['Development', 'Business', 'Finance', 'IT & Software', 'Design', 'Marketing', 'Music', 'Other'],
    default: 'Other'
  },
  learningOutcomes: [{
    type: String
  }],
  lessons: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    order: {
      type: Number,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    duration: Number,
    materials: [{
      name: String,
      url: String
    }]
  }],
  // Simple array of student IDs
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Detailed enrollment data
  enrollmentDetails: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    completedLessons: [{
      lessonId: String,
      completedAt: Date
    }]
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
courseSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
  }
  
  // Update enrollment count
  this.enrollmentCount = this.enrolledStudents.length;
  
  next();
});

module.exports = mongoose.model('Course', courseSchema); 