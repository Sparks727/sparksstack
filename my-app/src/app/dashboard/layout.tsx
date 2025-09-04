"use client";

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { MenuIcon, XIcon, UserIcon, BuildingIcon, HomeIcon, ChevronDownIcon, LogOutIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu button, page info, and collapse button */}
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
            
            {/* Collapse button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarToggle}
              className="h-9 w-9 p-0"
            >
              {isSidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Right side - User avatar with dropdown */}
          <div className="flex items-center">
            {user && (
              <div className="relative user-menu">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  {user.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4 text-primary" />
                  )}
                </Button>
                
                {/* Mobile User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/dashboard/profile">
                        <div className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer">
                          <UserIcon className="h-4 w-4" />
                          <span className="text-sm">Profile</span>
                        </div>
                      </Link>
                      <SignOutButton>
                        <div className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer text-red-600 hover:text-red-700">
                          <LogOutIcon className="h-4 w-4" />
                          <span className="text-sm">Sign Out</span>
                        </div>
                      </SignOutButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header - Full width across top */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 w-full">
          {/* Left side - Sparks Stack Logo, Name, and Collapse Button */}
          <div className="flex items-center gap-4">
            <Image
              src="/SparksStackLogo.png"
              alt="Sparks Stack"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-semibold">Sparks Stack</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarToggle}
              className="h-8 w-8 p-0 ml-2"
            >
              {isSidebarCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Right side - User avatar with dropdown */}
          <div className="flex items-center">
            {user && (
              <div className="relative user-menu">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="h-9 px-3 py-2 flex items-center gap-2 hover:bg-muted"
                >
                  {user.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {user.fullName || user.username || 'User'}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
                
                {/* Desktop User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/dashboard/profile">
                        <div className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer">
                          <UserIcon className="h-4 w-4" />
                          <span className="text-sm">Profile</span>
                        </div>
                      </Link>
                      <SignOutButton>
                        <div className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer text-red-600 hover:text-red-700">
                          <LogOutIcon className="h-4 w-4" />
                          <span className="text-sm">Sign Out</span>
                        </div>
                      </SignOutButton>
                    </div>
                  </div>
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
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        {/* Mobile Header Spacer */}
        <div className="lg:hidden h-20" />
        {/* Desktop Header Spacer */}
        <div className="hidden lg:block h-16" />
        {children}
      </main>
    </div>
  );
} 