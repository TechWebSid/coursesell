const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Calculate completion percentage
enrollmentSchema.methods.calculateProgress = function() {
    if (!this.progress.length) return 0;
    
    const completedItems = this.progress.filter(item => item.completed).length;
    return (completedItems / this.progress.length) * 100;
};

// Update completion status based on progress
enrollmentSchema.pre('save', function(next) {
    const progressPercentage = this.calculateProgress();
    
    if (progressPercentage === 0) {
        this.completionStatus = 'not-started';
    } else if (progressPercentage === 100) {
        this.completionStatus = 'completed';
        this.completionDate = new Date();
    } else {
        this.completionStatus = 'in-progress';
    }
    
    next();
});

// Ensure unique enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema); 