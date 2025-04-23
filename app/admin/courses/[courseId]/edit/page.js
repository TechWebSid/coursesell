'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditCourse({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.courseId;
  
  const [course, setCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'draft'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          let errorMessage = 'Failed to fetch course details';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
          throw new Error(errorMessage);
        }

        let courseData;
        try {
          courseData = await response.json();
          setCourse(courseData);
          setFormData({
            title: courseData.title || '',
            description: courseData.description || '',
            price: courseData.price || 0,
            status: courseData.status || 'draft'
          });
        } catch (parseError) {
          console.error('Error parsing course data:', parseError);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare data for API
      const courseData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        status: formData.status
      };

      console.log('Sending course data for update:', courseData);

      const response = await fetch(`http://localhost:5000/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      // Handle non-ok response
      if (!response.ok) {
        let errorMessage = 'Failed to update course';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Successfully updated course
      alert('Course updated successfully');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
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
          <p className="text-sm text-gray-500 mb-4">
            Make sure you have admin permissions and are logged in.
          </p>
          <div className="flex justify-center">
            <Link
              href="/admin/courses"
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition duration-300"
            >
              Return to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto border-l-4 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Course Not Found</h2>
          <p className="text-gray-700 mb-4">The requested course could not be found or you don't have permission to view this course.</p>
          <div className="flex justify-center">
            <Link
              href="/admin/courses"
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition duration-300"
            >
              Return to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-800">Edit Course</h1>
          <Link
            href="/admin/courses"
            className="px-5 py-3 border border-indigo-300 rounded-lg text-indigo-700 font-medium bg-white shadow-sm hover:bg-indigo-50 transition duration-300 flex items-center"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Courses
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100 mb-8">
          <div className="px-6 py-5 bg-gradient-to-r from-purple-500 to-pink-600">
            <div className="flex items-center">
              {course.thumbnail ? (
                <img
                  src={`http://localhost:5000${course.thumbnail}`}
                  alt={course.title}
                  className="h-24 w-36 object-cover rounded-lg shadow-md mr-4"
                />
              ) : (
                <div className="h-24 w-36 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-lg shadow-md flex items-center justify-center mr-4">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{course.title || 'Untitled Course'}</h2>
                <p className="text-indigo-100">Instructor: {course.instructor?.fullName || 'Unknown Instructor'}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    course.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="text-black">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="4"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    step="1"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
{/* 
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-700 to-gray-900">
            <h2 className="text-xl font-bold text-white">Advanced Options</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-red-900">Delete Course</h3>
                <p className="text-sm text-red-600">This action cannot be undone. All data associated with this course will be permanently removed.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                    router.push('/admin/courses');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition duration-150"
              >
                Delete Course
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Course Content</h3>
                <p className="text-sm text-gray-500">Manage course content, lessons, and materials</p>
              </div>
              <Link
                href={`/admin/courses/${courseId}/content`}
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                Manage Content
              </Link>
            </div>
            
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-blue-900">View Enrollments</h3>
                <p className="text-sm text-blue-600">See students enrolled in this course</p>
              </div>
              <Link
                href={`/admin/courses/${courseId}/enrollments`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-150"
              >
                View Enrollments
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
} 