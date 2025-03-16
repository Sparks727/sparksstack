"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const { user, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 border-b bg-white">
      {/* Left side: Mobile menu button */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-md lg:hidden text-gray-500 hover:bg-gray-100"
          onClick={toggleMobileSidebar}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right side: Notifications and User Button */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
          <Bell size={20} />
        </button>
        
        {isLoaded && user && (
          <div className="flex items-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </div>
    </header>
  );
} 