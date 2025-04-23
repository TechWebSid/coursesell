import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find the course and verify ownership
    const course = await Course.findOne({ 
      _id: params.id,
      instructor: session.user.id 
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete associated files
    if (course.thumbnail) {
      try {
        const thumbnailPath = path.join(process.cwd(), course.thumbnail);
        await unlink(thumbnailPath);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }

    if (course.video) {
      try {
        const videoPath = path.join(process.cwd(), course.video);
        await unlink(videoPath);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }

    // Delete the course
    await Course.deleteOne({ _id: params.id });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 