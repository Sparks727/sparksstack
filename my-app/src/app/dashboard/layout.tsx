"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  // Protect dashboard routes - redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect('/');
    }
  }, [isLoaded, isSignedIn]);

  // Show nothing while checking authentication
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Render the dashboard with the protected children
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
} 