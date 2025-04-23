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

    // Get total courses
    const totalCourses = await Course.countDocuments({ instructor: session.user.id });

    // Get total students (unique students across all courses)
    const enrollments = await Enrollment.find({
      course: { 
        $in: (await Course.find({ instructor: session.user.id }, '_id')).map(c => c._id) 
      }
    });
    const uniqueStudents = new Set(enrollments.map(e => e.student.toString())).size;

    // Calculate total revenue
    const totalRevenue = enrollments.reduce((sum, enrollment) => sum + enrollment.amount, 0);

    return NextResponse.json({
      totalCourses,
      totalStudents: uniqueStudents,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 