'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/admin/payments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch payments');
        }

        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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

  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Calculate success rate
  const successPayments = payments.filter(p => p.status === 'success').length;
  const successRate = payments.length > 0 ? (successPayments / payments.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 sm:mb-0">Payment Analytics</h1>
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

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
            <div className="px-6 py-5 bg-gradient-to-r from-teal-500 to-cyan-600">
              <h2 className="text-lg font-bold text-white">Total Revenue</h2>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              <p className="text-4xl font-extrabold text-teal-700">{formatCurrency(totalRevenue)}</p>
              <p className="text-gray-500 mt-2">From {payments.length} transactions</p>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
              <h2 className="text-lg font-bold text-white">Success Rate</h2>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              <p className="text-4xl font-extrabold text-indigo-700">{successRate.toFixed(1)}%</p>
              <p className="text-gray-500 mt-2">{successPayments} successful payments</p>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600">
              <h2 className="text-lg font-bold text-white">Average Transaction</h2>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              <p className="text-4xl font-extrabold text-amber-700">
                {formatCurrency(payments.length > 0 ? totalRevenue / payments.length : 0)}
              </p>
              <p className="text-gray-500 mt-2">Per transaction</p>
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-xl text-gray-600">No payment records found</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-indigo-100">
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600">
              <h2 className="text-xl font-bold text-white">
                Transaction History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-indigo-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                        {payment.razorpayPaymentId ? 
                          <span className="bg-gray-100 p-1 rounded">
                            {payment.razorpayPaymentId.substring(0, 8)}...
                          </span> : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                            {payment.user?.fullName ? payment.user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-indigo-800">
                              {payment.user?.fullName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {payment.user?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{payment.course?.title || 'Unknown Course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
                          payment.status === 'success' ? 'bg-green-100 text-green-800' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status || 'processing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 