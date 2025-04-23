'use client';
import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white bg-opacity-90 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">LearnHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-indigo-600 transition">Home</Link>
            <Link href="/courses" className="text-gray-700 hover:text-indigo-600 transition">Browse Courses</Link>
            <Link href="/instructors" className="text-gray-700 hover:text-indigo-600 transition">Instructors</Link>
            <Link href="/pricing" className="text-gray-700 hover:text-indigo-600 transition">Pricing</Link>
            <Link href="/contact" className="text-gray-700 hover:text-indigo-600 transition">Contact</Link>
            <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600 transition">Login</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition">Home</Link>
          <Link href="/courses" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition">Browse Courses</Link>
          <Link href="/instructors" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition">Instructors</Link>
          <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition">Pricing</Link>
          <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition">Contact</Link>
          <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-indigo-600 transition">Login</Link>
          <Link href="/signup" className="block px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 