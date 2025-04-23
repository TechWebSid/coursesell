'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CoursePlayer() {
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view this course');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/courses/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to fetch course');
        }

        setCourse(data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error.message || 'An error occurred while loading the course');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <svg 
            className="w-16 h-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/user/enrolled-courses" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to My Courses
          </a>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600">The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{course.title}</h1>

        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-8 aspect-video">
          {course.video && (
            <video
              className="w-full h-full"
              controls
              src={`http://localhost:5000${course.video}`}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">About This Course</h2>
            <p className="text-gray-600 mb-6">{course.description}</p>

            {/* Instructor Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">Instructor</h3>
              <p className="text-gray-600">
                {course.instructor?.fullName || 'Unknown Instructor'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 