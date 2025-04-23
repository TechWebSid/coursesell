import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all courses by this instructor
    const courses = await Course.find({ instructor: session.user.id }, '_id');
    const courseIds = courses.map(course => course._id);

    // Get all enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'name email') // Get student details
      .populate('course', 'title') // Get course title
      .sort('-enrollmentDate'); // Sort by newest first

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 