"use client";

import { useState } from 'react';
import { BellIcon, MenuIcon } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';

interface HeaderProps {
  toggleMobileSidebar?: () => void;
}

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const { user } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          <MenuIcon size={20} />
        </button>
        <div className="ml-4 lg:ml-0">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          >
            <BellIcon size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              </div>
              <div className="px-4 py-2 text-sm text-gray-700">
                <p>You have no new notifications.</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <span className="hidden md:block mr-2 text-sm font-medium text-gray-700">
            {user?.firstName || 'User'}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
} 