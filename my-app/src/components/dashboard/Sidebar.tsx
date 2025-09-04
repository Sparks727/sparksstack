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
      title: 'Create New',
      href: '/dashboard/organizations/create',
      icon: BuildingIcon,
    },
    {
      title: 'Manage',
      href: '/dashboard/organizations/manage',
      icon: SettingsIcon,
    },
    {
      title: 'Invite Members',
      href: '/dashboard/organizations/invite',
      icon: UsersIcon,
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
        "flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-semibold">SparksStack</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
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
                  <Button
                    variant={isItemActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="ml-2">
                        {item.title}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 space-y-2">
          {/* Current Organization */}
          {organization && !isCollapsed && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <BuildingIcon className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{organization.name}</p>
                  <p className="text-xs text-muted-foreground">Active Organization</p>
                </div>
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center space-x-2 p-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || 'User'} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-primary" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <SignOutButton>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
                isCollapsed && "justify-center px-2"
              )}
            >
              <LogOutIcon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
