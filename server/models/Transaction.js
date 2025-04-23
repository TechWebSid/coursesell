const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String
    },
    refundAmount: {
        type: Number
    },
    refundReason: {
        type: String
    },
    refundDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Create enrollment after successful payment
transactionSchema.post('save', async function(doc) {
    if (doc.status === 'completed') {
        const Enrollment = mongoose.model('Enrollment');
        
        try {
            await Enrollment.create({
                student: doc.user,
                course: doc.course,
                paymentId: doc.razorpayPaymentId,
                amount: doc.amount
            });

            // Update course enrollment count
            const Course = mongoose.model('Course');
            await Course.findByIdAndUpdate(doc.course, {
                $inc: { enrollmentCount: 1 }
            });
        } catch (error) {
            console.error('Error creating enrollment:', error);
        }
    }
});

module.exports = mongoose.model('Transaction', transactionSchema); 