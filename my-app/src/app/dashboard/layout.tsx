"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

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
    <>
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar />
          <main className="flex w-full flex-col overflow-hidden">
            <div className="container flex-1 pb-12 pt-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 