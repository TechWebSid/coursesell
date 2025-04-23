'use client';
import UserNavbar from '@/app/components/UserNavbar';

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 