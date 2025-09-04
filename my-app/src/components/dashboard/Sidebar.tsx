"use client";

import { useUser, useOrganization } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BuildingIcon, 
  UserIcon, 
  SettingsIcon, 
  HomeIcon, 
  UsersIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation: NavItem[] = [
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
    <div className={cn("flex h-screen", className)}>
      <div className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 shadow-lg lg:shadow-none",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image
                  src="/SparksStackLogo.png"
                  alt="Sparks Stack Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="font-semibold">Sparks Stack</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 lg:flex hidden"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isItemActive = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    isItemActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    "min-h-[44px] lg:min-h-[40px]" // Better touch targets on mobile
                  )}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
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
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.fullName || user.username || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
