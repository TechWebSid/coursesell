'use client';
import { useState, useEffect } from 'react';
import CourseCard from '@/app/components/CourseCard';
import Script from 'next/script';

// Fixed Razorpay key
const RAZORPAY_KEY_ID = 'rzp_test_f1AQGx0KhuF0SI';

export default function AvailableCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Check if Razorpay is loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
    
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/available');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleRazorpayLoad = () => {
    console.log("Razorpay script loaded");
    setRazorpayLoaded(true);
  };

  const handlePurchase = async (courseId) => {
    try {
      if (isProcessing) return;
      setIsProcessing(true);
      setError('');
      
      if (!razorpayLoaded) {
        setError("Payment gateway is still loading. Please try again in a moment.");
        setIsProcessing(false);
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login first");
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }

      console.log("Creating order for course:", courseId);
      
      // Create order
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      });

      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        console.error("Order creation failed:", orderData);
        throw new Error(orderData.error || orderData.details || 'Failed to create order');
      }

      console.log("Order created:", orderData);

      // Initialize Razorpay with the fixed key ID
      const options = {
        key: RAZORPAY_KEY_ID, // Use fixed key instead of from response
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Course Purchase",
        description: "Course Enrollment Payment",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            console.log("Payment successful:", response);
            
            const verifyResponse = await fetch('http://localhost:5000/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || verifyData.details || 'Payment verification failed');
            }

            // Show success message
            setError('');
            alert('Payment successful! Redirecting to your enrolled courses...');
            
            // Redirect to enrolled courses page
            window.location.href = '/user/enrolled-courses';
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed: ' + error.message);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userData?.fullName || userData?.name || "",
          email: userData?.email || ""
        },
        theme: {
          color: "#6366F1"
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            setIsProcessing(false);
          }
        }
      };

      // Create and open Razorpay checkout
      try {
        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function(response) {
          console.error('Payment failed:', response.error);
          setError(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
          setIsProcessing(false);
        });
        
        razorpay.open();
      } catch (razorpayError) {
        console.error("Error initializing Razorpay:", razorpayError);
        setError(`Payment gateway error: ${razorpayError.message}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // If unauthorized, redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={handleRazorpayLoad}
      />
      
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-gray-600">
            Explore our collection of high-quality courses and start learning today.
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-center mb-8 p-4 bg-red-50 rounded">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="text-blue-600 text-center mb-8 p-4 bg-blue-50 rounded">
            Processing your request...
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isEnrolled={false}
              onPurchase={() => handlePurchase(course._id)}
            />
          ))}
        </div>

        {!loading && courses.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </>
  );
} 