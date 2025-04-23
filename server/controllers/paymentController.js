const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Initialize Razorpay with direct keys - no env variables
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: 'rzp_test_f1AQGx0KhuF0SI',
    key_secret: 'fNqnIOQz9W2c5WPL7gmhYUxr'
  });
  console.log("Razorpay initialized successfully");
} catch (error) {
  console.error("Error initializing Razorpay:", error);
}

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    console.log("Create order request received:", req.body);
    
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not initialized' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
    
    // Get user ID as string to avoid ObjectId issues
    const userId = (req.user._id || req.user.id).toString();
    console.log("User ID:", userId);

    // Get course details
    let course;
    try {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
    } catch (findError) {
      console.error("Error finding course:", findError);
      return res.status(500).json({ error: 'Database error finding course', details: findError.message });
    }
    
    // Convert ID to string
    const courseIdStr = course._id.toString();
    console.log("Course found:", { id: courseIdStr, price: course.price });

    if (!course.price || course.price <= 0) {
      return res.status(400).json({ error: 'Invalid course price' });
    }

    // Check if already enrolled
    try {
      const isEnrolled = course.enrolledStudents && course.enrolledStudents.some(studentId => 
        studentId && studentId.toString() === userId.toString()
      );
      
      if (isEnrolled) {
        return res.status(400).json({ error: 'You are already enrolled in this course' });
      }
    } catch (enrollError) {
      console.error("Error checking enrollment:", enrollError);
    }

    // Create Razorpay order
    try {
      // Make sure the amount is an integer (paise)
      const amountInPaise = Math.round(parseFloat(course.price) * 100);
      
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        return res.status(400).json({ error: 'Invalid amount calculation' });
      }
      
      // Create a shorter receipt ID within 40 characters
      const timestamp = Date.now().toString().slice(-10);
      const shortCourseId = courseId.toString().slice(-6);
      const shortUserId = userId.toString().slice(-6);
      const receipt = `rcpt_${shortCourseId}_${shortUserId}_${timestamp}`;

      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt, // Using shortened receipt
      };
      
      console.log("Creating Razorpay order with options:", options);
      
      try {
        const order = await razorpay.orders.create(options);
        console.log("Razorpay order created:", order);

        res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          courseId,
          razorpayKeyId: 'rzp_test_f1AQGx0KhuF0SI' // Updated key ID
        });
      } catch (error) {
        // Handle specific Razorpay error codes
        console.error("Razorpay API Error:", {
          error_message: error.message,
          error_code: error.code,
          error_description: error.description,
          error_source: error.source,
          error_step: error.step,
          error_reason: error.reason,
          error_metadata: error.metadata,
          full_error: error
        });
        
        // Check if it's a Razorpay error with error object
        if (error.statusCode && error.error) {
          const razorError = error.error;
          return res.status(500).json({ 
            error: 'Failed to create Razorpay order',
            details: razorError.description || error.message,
            code: razorError.code || 'unknown',
            reason: razorError.reason || 'unknown'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to create Razorpay order',
            details: error.message,
            code: error.code || 'unknown',
            reason: error.reason || 'unknown'
          });
        }
      }
    } catch (razorpayError) {
      console.error("Razorpay API Error:", razorpayError);
      return res.status(500).json({ error: 'Failed to create Razorpay order', details: razorpayError.message });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

// Verify payment and enroll student
exports.verifyPayment = async (req, res) => {
  try {
    console.log("Payment verification request received:", req.body);
    
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not initialized' });
    }
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Order ID, Payment ID, Signature and Course ID are required' 
      });
    }

    // Verify signature
    try {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', 'fNqnIOQz9W2c5WPL7gmhYUxr') // Updated key secret
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error("Signature mismatch:", { expected: expectedSignature, received: razorpay_signature });
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    } catch (signatureError) {
      console.error("Error verifying signature:", signatureError);
      return res.status(500).json({ error: 'Error verifying signature', details: signatureError.message });
    }

    const userId = (req.user._id || req.user.id).toString();
    console.log("User ID for enrollment:", userId);

    // Get course and user details
    let course, user;
    try {
      [course, user] = await Promise.all([
        Course.findById(courseId),
        User.findById(userId)
      ]);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log("Found course and user for enrollment");
    } catch (findError) {
      console.error("Error finding course or user:", findError);
      return res.status(500).json({ error: 'Database error', details: findError.message });
    }

    // Check if already enrolled
    try {
      const isEnrolled = course.enrolledStudents && course.enrolledStudents.some(studentId => 
        studentId && studentId.toString() === userId.toString()
      );
      
      if (isEnrolled) {
        return res.status(400).json({ error: 'Already enrolled in this course' });
      }
    } catch (enrollError) {
      console.error("Error checking enrollment:", enrollError);
    }

    // Create payment record
    try {
      const payment = new Payment({
        user: userId,
        course: courseId,
        instructor: course.instructor,
        amount: course.price,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      });
      await payment.save();
      console.log("Payment record created");
    } catch (paymentError) {
      console.error("Error creating payment record:", paymentError);
      // Continue with enrollment even if payment record fails
    }

    // Update course enrollment
    try {
      // Initialize enrolledStudents if it doesn't exist
      if (!course.enrolledStudents) {
        course.enrolledStudents = [];
      }
      
      course.enrolledStudents.push(userId);
      
      // Check if enrollmentDetails exists before pushing
      if (Array.isArray(course.enrollmentDetails)) {
        course.enrollmentDetails.push({
          student: userId,
          enrollmentDate: new Date(),
          progress: 0,
          completedLessons: []
        });
      } else {
        // If enrollmentDetails doesn't exist or is not an array, initialize it
        course.enrollmentDetails = [{
          student: userId,
          enrollmentDate: new Date(),
          progress: 0,
          completedLessons: []
        }];
      }
      
      await course.save();
      console.log("Course enrollment updated");
    } catch (courseUpdateError) {
      console.error("Error updating course enrollment:", courseUpdateError);
      return res.status(500).json({ error: 'Error updating course enrollment', details: courseUpdateError.message });
    }

    // Update user's enrolled courses
    try {
      // Initialize enrolledCourses if it doesn't exist
      if (!user.enrolledCourses) {
        user.enrolledCourses = [];
      }
      
      // Check if already in the array
      const courseIdStr = courseId.toString();
      const alreadyEnrolled = user.enrolledCourses.some(id => 
        id && id.toString() === courseIdStr
      );
      
      if (!alreadyEnrolled) {
        user.enrolledCourses.push(courseId);
        await user.save();
        console.log(`User ${userId} enrolled in course ${courseIdStr}`);
      } else {
        console.log(`User ${userId} already enrolled in course ${courseIdStr}`);
      }
    } catch (userUpdateError) {
      console.error("Error updating user enrollment:", userUpdateError);
      // Don't return error here, as the enrollment has already been recorded in the course
    }

    res.json({ 
      success: true, 
      message: 'Payment successful and enrollment completed' 
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment', details: error.message });
  }
};