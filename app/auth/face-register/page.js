'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WebcamCapture from '@/app/components/WebcamCapture';

const FaceRegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = async (imageSrc) => {
    if (!userId) {
      setError('User ID is missing. Please try registering again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/face-auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          image: imageSrc
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register face');
      }

      // Registration successful
      router.push('/auth/login?message=Face registered successfully! Please login.');
    } catch (error) {
      console.error('Face registration error:', error);
      setError(error.message || 'Failed to register face. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid registration link. Please try registering again.</p>
          <button
            onClick={() => router.push('/auth/register')}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">One Last Step!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's register your face for secure login
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <WebcamCapture 
          onCapture={handleCapture} 
          isRegistration={true}
        />

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default FaceRegisterPage; 