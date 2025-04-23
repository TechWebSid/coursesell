import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import path from 'path';

// Helper function to save uploaded file
async function saveFile(file, type) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create unique filename
  const filename = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), 'uploads', type);
  const filepath = path.join(uploadDir, filename);
  
  await writeFile(filepath, buffer);
  return `/uploads/${type}/${filename}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const courses = await Course.find({ instructor: session.user.id });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Handle file uploads
    let thumbnailPath = null;
    let videoPath = null;
    
    const thumbnail = formData.get('thumbnail');
    const video = formData.get('video');
    
    if (thumbnail) {
      thumbnailPath = await saveFile(thumbnail, 'thumbnails');
    }
    
    if (video) {
      videoPath = await saveFile(video, 'videos');
    }

    await connectDB();
    const course = await Course.create({
      title: formData.get('title'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      thumbnail: thumbnailPath,
      video: videoPath,
      instructor: session.user.id
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 