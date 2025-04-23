'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/admin/courses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          price: course.price,
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update course status');
      }

      // Update the course in the state
      setCourses(courses.map(c => 
        c._id === courseId ? { ...c, status: newStatus } : c
      ));
      
      alert(`Course status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating course status:', error);
      alert(`Failed to update course status: ${error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete course');
      }

      // Remove the deleted course from the state
      setCourses(courses.filter(course => course._id !== courseId));
      alert('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(`Failed to delete course: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px] bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto border-l-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure you have admin permissions and are logged in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 sm:mb-0">Course Management</h1>
          <Link
            href="/admin/dashboard"
            className="px-5 py-3 border border-indigo-300 rounded-lg text-indigo-700 font-medium bg-white shadow-sm hover:bg-indigo-50 transition duration-300 flex items-center justify-center"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p className="text-xl text-gray-600">No courses available</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600">
              <h2 className="text-xl font-bold text-white">
                {courses.length} Courses Available
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {courses.map((course) => (
                <li key={course._id} className="p-6 hover:bg-indigo-50 transition duration-150">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          className="h-24 w-36 object-cover rounded-lg shadow-md"
                          src={`http://localhost:5000${course.thumbnail}`}
                          alt={course.title}
                        />
                      ) : (
                        <div className="h-24 w-36 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-lg shadow-md flex items-center justify-center">
                          <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-indigo-800">{course.title || 'Untitled Course'}</h3>
                      <p className="mt-1 text-base text-gray-600 line-clamp-2">{course.description || 'No description available'}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-indigo-900">₹{course.price || 0}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="mr-1 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          <span className="text-gray-700">
                            {course.instructor?.fullName || 'Unknown Instructor'}
                          </span>
                        </div>
                        
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          course.status === 'published' ? 'bg-green-100 text-green-800' :
                          course.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                      <select
                        value={course.status || ''}
                        onChange={(e) => handleStatusChange(course._id, e.target.value)}
                        className="w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                      
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/admin/courses/${course._id}/edit`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Edit
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition duration-300"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 