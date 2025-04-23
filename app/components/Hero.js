import Link from 'next/link';

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-indigo-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Learn from the Best.
              <span className="block text-indigo-600">Anywhere, Anytime.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of learners. Get certified. Upskill your career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/courses" 
                className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
              >
                Explore Courses
              </Link>
              <Link 
                href="/become-instructor" 
                className="px-8 py-3 text-lg font-medium text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-300 transform hover:scale-105"
              >
                Become an Instructor
              </Link>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full filter blur-3xl opacity-70"></div>
              <svg 
                className="relative w-full h-auto"
                viewBox="0 0 400 400" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="200" cy="200" r="180" stroke="#4F46E5" strokeWidth="4" strokeDasharray="8 8"/>
                <rect x="120" y="120" width="160" height="120" rx="8" fill="#4F46E5" fillOpacity="0.2"/>
                <rect x="140" y="160" width="120" height="60" rx="4" fill="#4F46E5" fillOpacity="0.4"/>
                <circle cx="200" cy="280" r="40" fill="#4F46E5" fillOpacity="0.3"/>
                <path d="M180 270L220 290" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">1000+</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">100+</div>
            <div className="text-gray-600">Expert Instructors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">500+</div>
            <div className="text-gray-600">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">4.8</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 