"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      {/* Sidebar for mobile - controlled by state */}
      <div className={`fixed inset-y-0 left-0 z-30 lg:hidden transform ${
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
        <Sidebar />
      </div>
      
      {/* Sidebar for desktop - always visible */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header toggleMobileSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
} 