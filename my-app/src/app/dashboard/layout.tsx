"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';

export default function DashboardPageLayout({
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

  // Render the dashboard with the protected children and the new layout
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
} 