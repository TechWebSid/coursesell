import Link from 'next/link';

const InstructorInvite = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Are you an expert in your field?
              <span className="block mt-2">Share your knowledge with the world.</span>
            </h2>
            <p className="text-xl opacity-90">
              Join our community of expert instructors and help thousands of students achieve their goals.
            </p>
            <ul className="space-y-4">
              {[
                "Create and sell courses in your expertise",
                "Reach students globally",
                "Earn revenue from your knowledge",
                "Get support from our dedicated team"
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link 
                href="/become-instructor"
                className="inline-block px-8 py-3 text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
              >
                Become an Instructor
              </Link>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="grid text-black grid-cols-2 gap-8">
            {[
              { number: "10M+", label: "Student Reach" },
              { number: "$50K+", label: "Average Earnings" },
              { number: "100%", label: "Support" },
              { number: "4.8/5", label: "Instructor Rating" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white text-black bg-opacity-10 rounded-lg p-6 text-center backdrop-blur-sm"
              >
                <div className="text-3xl font-bold  mb-2">{stat.number}</div>
                <div className=" text-black opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorInvite; 