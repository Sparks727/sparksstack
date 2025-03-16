"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { Menu, Bell, ChevronDown, MapPin } from 'lucide-react';
import { useLocationStore } from '@/lib/store/location-store';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export default function Header({ toggleMobileSidebar }: HeaderProps) {
  const { user, isLoaded } = useUser();
  const { locations, activeLocationId, setActiveLocation } = useLocationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the active location or "All Locations" if null
  const activeLocation = activeLocationId 
    ? locations.find(loc => loc.id === activeLocationId) 
    : null;

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle location selection
  const handleLocationChange = (id: string | null) => {
    setActiveLocation(id);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 border-b bg-white">
      {/* Left side: Mobile menu button and Location Switcher */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-md lg:hidden text-gray-500 hover:bg-gray-100"
          onClick={toggleMobileSidebar}
        >
          <Menu size={20} />
        </button>
        
        {/* Location Switcher */}
        <div className="relative ml-4" ref={dropdownRef}>
          <button 
            className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 text-sm font-medium"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex items-center">
              <MapPin size={16} className="mr-1 text-blue-500" />
              <div className="flex flex-col items-start">
                <span>{activeLocation ? activeLocation.name : "All Locations"}</span>
                {activeLocation && (
                  <span className="text-xs text-gray-500 truncate max-w-[240px]">
                    {activeLocation.address}
                  </span>
                )}
              </div>
              <ChevronDown size={16} className="ml-1" />
            </div>
          </button>
          
          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white shadow-lg rounded-md overflow-hidden z-20 border">
              {/* All Locations option */}
              <button
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${!activeLocationId ? 'bg-orange-50 text-orange-600' : ''}`}
                onClick={() => handleLocationChange(null)}
              >
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-blue-500" />
                  <span className="font-medium">All Locations</span>
                </div>
              </button>
              
              {/* Individual locations */}
              {locations.map(location => (
                <button
                  key={location.id}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${activeLocationId === location.id ? 'bg-orange-50 text-orange-600' : ''}`}
                  onClick={() => handleLocationChange(location.id)}
                >
                  <div className="flex">
                    <MapPin size={16} className="mr-2 text-blue-500 flex-shrink-0 mt-1" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-xs text-gray-500 truncate">{location.address}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
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