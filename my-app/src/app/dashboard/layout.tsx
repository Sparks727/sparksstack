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
          {/* Left side - Sparks Stack Logo, Name, and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/SparksStackLogo.png"
                alt="Sparks Stack"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="text-lg font-semibold">Sparks Stack</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map((item) => {
                const isItemActive = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isItemActive ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 px-3"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </nav>
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

      {/* Mobile Side Navigation */}
      <div className={`
        lg:hidden fixed left-0 top-0 h-full w-64 bg-background border-r border-border z-50
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Side Nav Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Image
                src="/SparksStackLogo.png"
                alt="Sparks Stack"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <span className="text-lg font-semibold">Sparks Stack</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isItemActive = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      isItemActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Mobile User Section */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.fullName || user.username || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {/* Mobile Header Spacer */}
        <div className="lg:hidden h-20" />
        {/* Desktop Header Spacer */}
        <div className="hidden lg:block h-16" />
        {children}
      </main>
    </div>
  );
} 