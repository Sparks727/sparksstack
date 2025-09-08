"use client";

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon, UserIcon, BuildingIcon, HomeIcon, ChevronDownIcon, LogOutIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components1/site-header';
import { AppSidebar } from '@/components/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Auto-collapse sidebar when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const getPageTitle = () => {
    if (!pathname) return 'Dashboard';
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/dashboard/profile') return 'Profile';
    if (pathname === '/dashboard/organizations') return 'Organizations';
    if (pathname.startsWith('/dashboard/organizations/')) return 'Organizations';
    if (pathname.startsWith('/dashboard/')) return 'Dashboard';
    return 'Dashboard';
  };

  const getPageIcon = () => {
    if (!pathname) return <HomeIcon className="h-5 w-5" />;
    if (pathname === '/dashboard') return <HomeIcon className="h-5 w-5" />;
    if (pathname === '/dashboard/profile') return <UserIcon className="h-5 w-5" />;
    if (pathname === '/dashboard/organizations' || pathname.startsWith('/dashboard/organizations/')) {
      return <BuildingIcon className="h-5 w-5" />;
    }
    return <HomeIcon className="h-5 w-5" />;
  };

  const navigation = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      title: 'Organizations',
      href: '/dashboard/organizations',
      icon: BuildingIcon,
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
    <div className="flex h-screen bg-background">
      <SidebarInset>
        {/* Inset Header (from components1) */}
        <SiteHeader />

      {/* Shadcn Sidebar (mobile offcanvas + desktop sidebar) */}
      <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
    </SidebarProvider>
  );
} 