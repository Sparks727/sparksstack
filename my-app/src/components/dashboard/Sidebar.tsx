'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building, 
  Settings, 
  LogOut, 
  Activity,
  Wrench
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

const Sidebar = () => {
  const pathname = usePathname() || '';
  
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true
    },
    {
      title: 'Business Accounts',
      path: '/dashboard/business-accounts',
      icon: <Building className="h-5 w-5" />,
      exact: false
    },
    {
      title: 'API Test',
      path: '/dashboard/api-test',
      icon: <Wrench className="h-5 w-5" />,
      exact: false
    },
    {
      title: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
      exact: false
    }
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <Activity className="h-6 w-6 mr-2 text-orange-500" />
            <span className="text-xl font-bold">SparksStack</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 ${
                    (item.exact ? pathname === item.path : isActive(item.path)) 
                      ? 'bg-orange-50 text-orange-600' 
                      : ''
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserButton />
              <span className="ml-3 text-sm font-medium text-gray-700">Account</span>
            </div>
            <Link 
              href="/api/auth/signout"
              className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 