'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditUser({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const userId = unwrappedParams.userId;
  
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          let errorMessage = 'Failed to fetch user details';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
          throw new Error(errorMessage);
        }

        let userData;
        try {
          userData = await response.json();
          setUser(userData);
          setFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            role: userData.role || 'user'
          });
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role
      };

      console.log('Sending user data for update:', userData);

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      // Handle non-ok response
      if (!response.ok) {
        let errorMessage = 'Failed to update user';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Successfully updated user
      alert('User updated successfully');
      router.push('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Are you sure you want to reset this user\'s password? They will receive an email with instructions.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to reset password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      alert('Password reset email has been sent to the user');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(`Failed to reset password: ${error.message}`);
    }
  };

  const handleDeleteFaceId = async () => {
    if (!confirm('Are you sure you want to delete this user\'s face authentication data? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/face-auth`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete face ID';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Update UI to reflect face ID deletion
      setUser({
        ...user,
        hasFaceId: false
      });
      
      alert('Face ID data has been deleted successfully');
    } catch (error) {
      console.error('Error deleting face ID:', error);
      alert(`Failed to delete face ID: ${error.message}`);
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
              href="/admin/users"
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition duration-300"
            >
              Return to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md mx-auto border-l-4 border-yellow-500">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">User Not Found</h2>
          <p className="text-gray-700 mb-4">The requested user could not be found or you don't have permission to view this user.</p>
          <div className="flex justify-center">
            <Link
              href="/admin/users"
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition duration-300"
            >
              Return to Users
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
          <h1 className="text-3xl font-extrabold text-indigo-800">Edit User</h1>
          <Link
            href="/admin/users"
            className="px-5 py-3 border border-indigo-300 rounded-lg text-indigo-700 font-medium bg-white shadow-sm hover:bg-indigo-50 transition duration-300 flex items-center"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Users
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100 mb-8">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-2xl mr-4">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user.fullName || 'Unknown User'}</h2>
                <p className="text-indigo-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 text-black">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={user.role === 'admin'} // Cannot change admin role
                  >
                    <option value="user">User</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
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

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
         
          
          {/* <div className="p-6 space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
                <p className="text-sm text-gray-500">Send a password reset email to this user</p>
              </div>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition duration-150"
              >
                Reset Password
              </button>
            </div>
            
            {user.hasFaceId && (
              <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-red-900">Face Authentication</h3>
                  <p className="text-sm text-red-600">Delete this user's face authentication data</p>
                </div>
                <button
                  onClick={handleDeleteFaceId}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition duration-150"
                >
                  Delete Face ID
                </button>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
} 