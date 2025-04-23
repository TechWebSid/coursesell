'use client';
import Image from 'next/image';

const CourseCard = ({ course, isEnrolled = false, onPurchase, onWatch }) => {
  // Format date to a readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      {/* Course Image */}
      <div className="relative h-48 w-full">
        <Image
          src={course.thumbnail ? `http://localhost:5000${course.thumbnail}` : '/placeholder-course.jpg'}
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Course Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
        
        {!isEnrolled && (
          <>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {course.description}
            </p>
            
            {/* Instructor and Date */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span className="mr-2">By {course.instructor?.fullName || 'Unknown Instructor'}</span>
              <span>•</span>
              <span className="ml-2">{course.createdAt ? formatDate(course.createdAt) : 'Recently added'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-indigo-600 font-semibold">
                ₹{course.price}
              </span>
              <button
                onClick={onPurchase}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Purchase
              </button>
            </div>
          </>
        )}

        {isEnrolled && (
          <div className="mt-4">
            {course.progress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-indigo-600">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            <button
              onClick={onWatch}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Watch Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard; 