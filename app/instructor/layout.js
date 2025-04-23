import Link from 'next/link';

export default function InstructorLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Instructor Panel</h2>
        </div>
        <nav className="mt-6">
          <Link href="/instructor/dashboard" 
                className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/instructor/courses" 
                className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            My Courses
          </Link>
          <Link href="/instructor/courses/create" 
                className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            Create Course
          </Link>
          <Link href="/instructor/students" 
                className="block px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            Enrolled Students
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 