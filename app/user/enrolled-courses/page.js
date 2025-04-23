'use client';
import { useState, useEffect } from 'react';
import CourseCard from '@/app/components/CourseCard';

export default function EnrolledCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/courses/enrolled', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch enrolled courses');
        }

        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setError('Failed to load enrolled courses');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleWatchCourse = (courseId) => {
    // This will be implemented when we add the course viewing functionality
    window.location.href = `/user/course/${courseId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h1>
        <p className="mt-2 text-gray-600">
          Continue learning from your enrolled courses.
        </p>
      </div>

      {error && (
        <div className="text-red-600 text-center mb-8">
          {error}
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            isEnrolled={true}
            onWatch={() => handleWatchCourse(course._id)}
          />
        ))}
      </div>

      {!loading && courses.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Enrolled Courses Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start your learning journey by enrolling in one of our courses.
            </p>
            <a
              href="/user/available-courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Courses
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 