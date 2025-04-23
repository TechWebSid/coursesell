'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch admin stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-2">Admin Dashboard</h1>
          <p className="text-indigo-600">Manage your platform efficiently</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-100 transform transition duration-300 hover:scale-105">
            <div className="px-4 py-6 sm:p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
              <dl>
                <dt className="text-sm font-medium text-white truncate">
                  Total Users
                </dt>
                <dd className="mt-1 text-3xl font-extrabold text-white">
                  {stats.totalUsers}
                </dd>
              </dl>
            </div>
            <div className="bg-white px-4 py-4 sm:px-6 border-t border-indigo-100">
              <div className="text-sm">
                <Link href="/admin/users" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                  <span>View all users</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-100 transform transition duration-300 hover:scale-105">
            <div className="px-4 py-6 sm:p-6 bg-gradient-to-r from-green-500 to-emerald-600">
              <dl>
                <dt className="text-sm font-medium text-white truncate">
                  Total Instructors
                </dt>
                <dd className="mt-1 text-3xl font-extrabold text-white">
                  {stats.totalInstructors}
                </dd>
              </dl>
            </div>
            <div className="bg-white px-4 py-4 sm:px-6 border-t border-indigo-100">
              <div className="text-sm">
                <Link href="/admin/users?role=instructor" className="font-medium text-green-600 hover:text-green-500 flex items-center">
                  <span>View all instructors</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-100 transform transition duration-300 hover:scale-105">
            <div className="px-4 py-6 sm:p-6 bg-gradient-to-r from-purple-500 to-pink-600">
              <dl>
                <dt className="text-sm font-medium text-white truncate">
                  Total Courses
                </dt>
                <dd className="mt-1 text-3xl font-extrabold text-white">
                  {stats.totalCourses}
                </dd>
              </dl>
            </div>
            <div className="bg-white px-4 py-4 sm:px-6 border-t border-indigo-100">
              <div className="text-sm">
                <Link href="/admin/courses" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                  <span>View all courses</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-100 transform transition duration-300 hover:scale-105">
            <div className="px-4 py-6 sm:p-6 bg-gradient-to-r from-amber-500 to-orange-600">
              <dl>
                <dt className="text-sm font-medium text-white truncate">
                  Total Payments
                </dt>
                <dd className="mt-1 text-3xl font-extrabold text-white">
                  {stats.totalPayments}
                </dd>
              </dl>
            </div>
            <div className="bg-white px-4 py-4 sm:px-6 border-t border-indigo-100">
              <div className="text-sm">
                <Link href="/admin/payments" className="font-medium text-amber-600 hover:text-amber-500 flex items-center">
                  <span>View all payments</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-indigo-100 transform transition duration-300 hover:scale-105">
            <div className="px-4 py-6 sm:p-6 bg-gradient-to-r from-teal-500 to-cyan-600">
              <dl>
                <dt className="text-sm font-medium text-white truncate">
                  Total Revenue
                </dt>
                <dd className="mt-1 text-3xl font-extrabold text-white">
                  ₹{stats.totalRevenue}
                </dd>
              </dl>
            </div>
            <div className="bg-white px-4 py-4 sm:px-6 border-t border-indigo-100">
              <div className="text-sm">
                <Link href="/admin/payments" className="font-medium text-teal-600 hover:text-teal-500 flex items-center">
                  <span>View revenue details</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-lg rounded-xl border border-indigo-100 mb-10">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/admin/users/create" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add New User
              </Link>
              <Link 
                href="/admin/courses" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition duration-300 ease-in-out"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Manage Courses
              </Link>
              <Link 
                href="/admin/users?role=instructor" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-300 ease-in-out"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Manage Instructors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 