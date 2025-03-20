'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  CircleHelp,
  CreditCard,
  Home,
  Settings,
  User,
  BarChart3,
  ActivitySquare,
  FileCode,
} from 'lucide-react';

interface NavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center py-2 px-4 rounded-md hover:bg-gray-100 text-sm font-medium",
        active && "bg-gray-100"
      )}
    >
      {children}
    </Link>
  );
}

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-gray-200 z-10 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Business Dashboard</h2>
      </div>

      <div className="p-2 space-y-1">
        <NavLink href="/dashboard" active={isActive("/dashboard") && pathname === "/dashboard"}>
          <Home className="h-5 w-5 mr-3" />
          Overview
        </NavLink>

        <div className="py-2">
          <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Google Business
          </h3>
          
          <NavLink href="/dashboard/api-direct-test" active={isActive("/dashboard/api-direct-test")}>
            <ActivitySquare className="h-5 w-5 mr-3" />
            API Diagnostics
          </NavLink>
          
          <NavLink href="/dashboard/google/metrics" active={isActive("/dashboard/google/metrics")}>
            <BarChart3 className="h-5 w-5 mr-3" />
            Profile Metrics
          </NavLink>
        </div>

        <div className="py-2">
          <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Account
          </h3>
          
          <NavLink href="/dashboard/profile" active={isActive("/dashboard/profile")}>
            <User className="h-5 w-5 mr-3" />
            Profile
          </NavLink>
          
          <NavLink href="/dashboard/settings" active={isActive("/dashboard/settings")}>
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </NavLink>
          
          <NavLink href="/dashboard/billing" active={isActive("/dashboard/billing")}>
            <CreditCard className="h-5 w-5 mr-3" />
            Billing
          </NavLink>
        </div>

        <div className="py-2">
          <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Help
          </h3>
          
          <NavLink href="/dashboard/help" active={isActive("/dashboard/help")}>
            <CircleHelp className="h-5 w-5 mr-3" />
            Documentation
          </NavLink>
          
          <NavLink href="/dashboard/developers" active={isActive("/dashboard/developers")}>
            <FileCode className="h-5 w-5 mr-3" />
            API Reference
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 