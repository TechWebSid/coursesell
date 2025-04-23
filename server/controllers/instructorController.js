const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Transaction = require('../models/Transaction');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const Payment = require('../models/Payment');

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const instructorId = req.user._id.toString();
        console.log("Fetching dashboard stats for instructor:", instructorId);

        // Get instructor's courses
        const courses = await Course.find({ instructor: instructorId });
        const totalCourses = courses.length;
        console.log("Total courses:", totalCourses);

        if (totalCourses === 0) {
            return res.json({
                totalCourses: 0,
                totalStudents: 0,
                totalRevenue: 0
            });
        }

        // Get course IDs
        const courseIds = courses.map(course => course._id);

        // Get students enrolled in instructor's courses using the new enrollment structure
        let uniqueStudentIds = new Set();
        let totalRevenue = 0;

        // Method 1: Check enrolledStudents arrays in courses
        courses.forEach(course => {
            if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
                course.enrolledStudents.forEach(studentId => {
                    if (studentId) {
                        uniqueStudentIds.add(studentId.toString());
                    }
                });
            }
        });

        // Method 2: Get payments for instructor's courses
        const payments = await Payment.find({
            course: { $in: courseIds },
            instructor: instructorId,
            status: 'success'
        });

        payments.forEach(payment => {
            // Add student ID to unique set
            if (payment.user) {
                uniqueStudentIds.add(payment.user.toString());
            }
            
            // Add payment amount to total revenue
            if (payment.amount) {
                totalRevenue += payment.amount;
            }
        });

        console.log(`Found ${uniqueStudentIds.size} unique students`);
        console.log(`Total revenue: ₹${totalRevenue}`);

        res.json({
            totalCourses,
            totalStudents: uniqueStudentIds.size,
            totalRevenue
        });
    } catch (error) {
        console.error('Error fetching instructor stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dashboard statistics',
            details: error.message
        });
    }
};

// Create Course
exports.createCourse = async (req, res) => {
    try {
        let thumbnailPath = null;
        let videoPath = null;

        // Handle file uploads
        if (req.files) {
            if (req.files.thumbnail) {
                const uploadDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
                const filename = `${Date.now()}-${req.files.thumbnail.name}`;
                await req.files.thumbnail.mv(path.join(uploadDir, filename));
                thumbnailPath = `/uploads/thumbnails/${filename}`;
            }
            
            if (req.files.video) {
                const uploadDir = path.join(__dirname, '..', 'uploads', 'videos');
                const filename = `${Date.now()}-${req.files.video.name}`;
                await req.files.video.mv(path.join(uploadDir, filename));
                videoPath = `/uploads/videos/${filename}`;
            }
        }

        const course = await Course.create({
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            thumbnail: thumbnailPath,
            video: videoPath,
            instructor: req.user._id,
            status: 'published'
        });

        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Course By ID
exports.getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        const instructorId = req.user._id.toString();
        console.log(`Fetching course ${courseId} for instructor ${instructorId}`);

        const course = await Course.findOne({ 
            _id: courseId,
            instructor: instructorId
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course details',
            message: error.message
        });
    }
};

// Update Course
exports.updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const instructorId = req.user._id.toString();
        console.log(`Updating course ${courseId} for instructor ${instructorId}`);

        // Check if course exists and belongs to instructor
        const course = await Course.findOne({ 
            _id: courseId,
            instructor: instructorId
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found or unauthorized'
            });
        }

        // Handle thumbnail upload if present
        let thumbnailPath = course.thumbnail;
        if (req.files && req.files.thumbnail) {
            try {
                // Delete old thumbnail if exists
                if (course.thumbnail) {
                    try {
                        await fs.unlink(path.join(__dirname, '..', course.thumbnail));
                    } catch (error) {
                        console.error('Error deleting old thumbnail:', error);
                    }
                }

                // Save new thumbnail
                const uploadDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
                const filename = `${Date.now()}-${req.files.thumbnail.name}`;
                await req.files.thumbnail.mv(path.join(uploadDir, filename));
                thumbnailPath = `/uploads/thumbnails/${filename}`;
            } catch (error) {
                console.error('Error processing thumbnail:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading thumbnail',
                    error: error.message
                });
            }
        }

        // Update course data
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                title: req.body.title,
                description: req.body.description,
                price: Number(req.body.price),
                status: req.body.status,
                thumbnail: thumbnailPath
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse
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

// Delete Course
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const instructorId = req.user._id.toString();
        console.log(`Attempting to delete course ${courseId} by instructor ${instructorId}`);

        // Check if course exists and belongs to instructor
        const course = await Course.findOne({ 
            _id: courseId,
            instructor: instructorId
        });

        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: 'Course not found or unauthorized',
                error: 'The course does not exist or you do not have permission to delete it'
            });
        }

        // Check if course has enrolled students
        if (course.enrolledStudents && course.enrolledStudents.length > 0) {
            console.log(`Course ${courseId} has ${course.enrolledStudents.length} enrolled students`);
            // You might want to prevent deletion of courses with enrolled students
            // or implement a refund system. For now, just log it.
        }

        // Delete associated files
        if (course.thumbnail) {
            try {
                const thumbnailPath = path.join(__dirname, '..', course.thumbnail);
                console.log(`Deleting thumbnail: ${thumbnailPath}`);
                await fs.unlink(thumbnailPath);
            } catch (error) {
                console.error('Error deleting thumbnail:', error);
                // Continue with deletion even if file removal fails
            }
        }

        if (course.video) {
            try {
                const videoPath = path.join(__dirname, '..', course.video);
                console.log(`Deleting video: ${videoPath}`);
                await fs.unlink(videoPath);
            } catch (error) {
                console.error('Error deleting video:', error);
                // Continue with deletion even if file removal fails
            }
        }

        // Delete the course
        const result = await Course.deleteOne({ _id: courseId });
        console.log(`Deleted course ${courseId}. Result:`, result);

        if (result.deletedCount === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete course',
                error: 'The course could not be deleted'
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Course deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
};

// Get Instructor Courses
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .sort('-createdAt');
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Course Details
exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const course = await Course.findById(courseId)
            .populate('instructor', 'name email');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Get Course Details Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course details'
        });
    }
};

// Upload Course Content
exports.uploadCourseContent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, order } = req.body;

        let videoUrl = '';
        let materials = [];

        if (req.files.video) {
            const result = await uploadToCloudinary(req.files.video[0].path, 'course-videos');
            videoUrl = result.secure_url;
        }

        if (req.files.materials) {
            for (const file of req.files.materials) {
                const result = await uploadToCloudinary(file.path, 'course-materials');
                materials.push({
                    name: file.originalname,
                    url: result.secure_url
                });
            }
        }

        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    contents: {
                        title,
                        description,
                        order,
                        videoUrl,
                        materials
                    }
                }
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Upload Course Content Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading course content'
        });
    }
};

// Get Enrolled Students
exports.getEnrollments = async (req, res) => {
    try {
        const instructorId = req.user._id.toString();
        console.log("Fetching enrolled students for instructor:", instructorId);

        // Get all courses by this instructor
        const courses = await Course.find({ instructor: instructorId }, '_id title');
        
        if (!courses || courses.length === 0) {
            return res.json([]);
        }

        const courseIds = courses.map(course => course._id);
        console.log("Found courses:", courseIds);

        // Method 1: Get student info from enrolledStudents in courses
        const enrollmentData = [];
        
        // Get all users who have enrolled in the instructor's courses
        const users = await User.find({
            enrolledCourses: { $in: courseIds }
        }, 'fullName email');
        
        console.log(`Found ${users.length} enrolled users`);
        
        // For each course, collect all students enrolled
        for (const course of courses) {
            // Find the course with populated enrolledStudents
            const courseWithDetails = await Course.findById(course._id);
            
            if (courseWithDetails && courseWithDetails.enrolledStudents && 
                Array.isArray(courseWithDetails.enrolledStudents)) {
                
                // For each enrolled student, find user details and add to enrollment data
                for (const studentId of courseWithDetails.enrolledStudents) {
                    if (!studentId) continue;
                    
                    const student = users.find(u => u._id.toString() === studentId.toString());
                    if (student) {
                        // Find enrollment details for progress
                        let progress = 0;
                        if (courseWithDetails.enrollmentDetails && 
                            Array.isArray(courseWithDetails.enrollmentDetails)) {
                            
                            const details = courseWithDetails.enrollmentDetails.find(
                                d => d.student && d.student.toString() === studentId.toString()
                            );
                            
                            if (details) {
                                progress = details.progress || 0;
                            }
                        }
                        
                        // Find payment record for enrollment date
                        const payment = await Payment.findOne({
                            course: course._id,
                            user: studentId,
                            status: 'success'
                        });
                        
                        enrollmentData.push({
                            _id: `${course._id}_${studentId}`,
                            student: {
                                _id: studentId,
                                name: student.fullName,
                                email: student.email
                            },
                            course: {
                                _id: course._id,
                                title: course.title
                            },
                            enrollmentDate: payment ? payment.createdAt : new Date(),
                            progress: progress
                        });
                    }
                }
            }
        }
        
        console.log(`Returning ${enrollmentData.length} enrollment records`);
        res.json(enrollmentData);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ 
            error: 'Failed to fetch enrollments',
            details: error.message
        });
    }
};

// Get Revenue Stats
exports.getRevenueStats = async (req, res) => {
    try {
        const instructorId = req.user._id;

        // Get monthly revenue for the last 6 months
        const monthlyRevenue = await Transaction.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            {
                $match: {
                    'courseDetails.instructor': mongoose.Types.ObjectId(instructorId),
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get revenue by course
        const revenueByCourse = await Transaction.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            {
                $match: {
                    'courseDetails.instructor': mongoose.Types.ObjectId(instructorId),
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$course',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            {
                $project: {
                    title: { $arrayElemAt: ['$courseInfo.title', 0] },
                    total: 1,
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                monthlyRevenue,
                revenueByCourse
            }
        });
    } catch (error) {
        console.error('Get Revenue Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue statistics'
        });
    }
};

// Update Course Status
exports.updateCourseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { status } = req.body;

        const course = await Course.findByIdAndUpdate(
            courseId,
            { status },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('Update Course Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating course status'
        });
    }
};

// Get Student Progress
exports.getStudentProgress = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: studentId
        }).populate('progress.content');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: enrollment.progress
        });
    } catch (error) {
        console.error('Get Student Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student progress'
        });
    }
}; 