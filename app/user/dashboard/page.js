'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    learningHours: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user data and token from localStorage
        const token = localStorage.getItem('token');
        const userDataStr = localStorage.getItem('user');

        if (!token) {
          throw new Error('No authentication token found');
        }

        if (!userDataStr) {
          throw new Error('No user data found');
        }

        const userData = JSON.parse(userDataStr);
        // Use name, fullName, or username in that order of preference
        const displayName = userData.name || userData.fullName || userData.username || 'Student';
        setUserName(displayName);

        // Fetch dashboard stats
        const response = await fetch('http://localhost:5000/api/courses/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        
        // If token is invalid or missing, redirect to login
        if (error.message.includes('token') || error.message.includes('user data')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ready to continue your learning journey? Explore our available courses or continue watching your enrolled courses.
        </p>
      </div>

      {error && (
        <div className="text-red-600 text-center mt-4 p-4 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Enrolled Courses
                  </dt>
                  <dd className="text-lg font-semibold text-indigo-600">
                    {stats.enrolledCourses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Lessons
                  </dt>
                  <dd className="text-lg font-semibold text-indigo-600">
                    {stats.completedLessons}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 overflow-hidden shadow rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Learning Hours
                  </dt>
                  <dd className="text-lg font-semibold text-indigo-600">
                    {stats.learningHours}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}