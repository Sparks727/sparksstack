"use client";

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon, UserIcon, BuildingIcon, HomeIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

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

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu button and page info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            
            {/* Page title and icon */}
            <div className="flex items-center gap-2">
              {getPageIcon()}
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Right side - Logo and user */}
          <div className="flex items-center gap-3">
            {/* Sparks Stack Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/SparksStackLogo.png"
                alt="Sparks Stack"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                Sparks Stack
              </span>
            </div>

            {/* User avatar */}
            {user && (
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                {user.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-primary" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className={`
        fixed lg:relative z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        {/* Mobile Header Spacer */}
        <div className="lg:hidden h-20" />
        {children}
      </main>
    </div>
  );
} 