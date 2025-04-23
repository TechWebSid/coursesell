'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WebcamCapture from '@/app/components/WebcamCapture';

const FaceLoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already face verified
  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (!userDataStr) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(userDataStr);
    if (userData.faceVerified) {
      router.push('/user/dashboard');
    }
  }, [router]);

  const handleVerify = async (imageSrc) => {
    if (!userId) {
      setError('User ID is missing. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get user data from localStorage to ensure we have the correct ID format
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataStr);
      const verifyUserId = userData._id || userData.id;

      if (!verifyUserId) {
        throw new Error('Invalid user ID');
      }

      // Make the API call with the correct user ID
      const response = await fetch('http://localhost:5001/api/face-auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: verifyUserId,
          image: imageSrc
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }

      // Check if the response indicates an error
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'Face verification failed';
        throw new Error(errorMessage);
      }

      // If we got here, verification was successful
      // Update user data with face verification status
      userData.faceVerified = true;
      localStorage.setItem('user', JSON.stringify(userData));

      // Show success message briefly before redirect
      setError('Face verification successful! Redirecting...');
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Face verification error:', error);
      setError(error.message || 'Face verification failed. Please try again.');
      
      // If there's a serious error, redirect back to login
      if (error.message.includes('User data not found') || error.message.includes('Invalid user ID')) {
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid login attempt. Please try logging in again.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Face Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please verify your face to continue
          </p>
        </div>

        {error && (
          <div className={`text-sm text-center p-3 rounded-md ${
            error.includes('successful')
              ? 'text-green-600 bg-green-50'
              : 'text-red-600 bg-red-50'
          }`}>
            {error}
          </div>
        )}

        <WebcamCapture 
          onCapture={handleVerify} 
          isRegistration={false}
          isLoading={isLoading}
        />

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default FaceLoginPage; 