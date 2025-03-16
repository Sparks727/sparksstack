"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Map, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Locations', href: '/dashboard/locations', icon: Map },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname() || '';

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside 
      className={`h-screen bg-white shadow-md flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-blue-400">
            SparksStack
          </Link>
        )}
        <button 
          onClick={toggleCollapsed} 
          className={`p-1 rounded-full hover:bg-gray-100 ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 pt-5">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-4 py-2 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-500 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${collapsed ? 'justify-center' : 'justify-start'}`}
                >
                  <item.icon size={20} className={collapsed ? 'mx-auto' : 'mr-3'} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Version info or profile at bottom */}
      <div className={`p-4 text-xs text-gray-500 border-t ${collapsed ? 'text-center' : ''}`}>
        {!collapsed && <span>v1.0.0</span>}
      </div>
    </aside>
  );
} 