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
  ShieldIcon,
  UsersIcon,
  FileTextIcon,
  BarChart3Icon,
  KeyIcon,
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
  badge?: string;
  children?: Omit<NavItem, 'children'>[];
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
      children: [
        {
          title: 'Overview',
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
      ],
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: SettingsIcon,
    },
    {
      title: 'Security',
      href: '/dashboard/security',
      icon: ShieldIcon,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3Icon,
    },
    {
      title: 'Documents',
      href: '/dashboard/documents',
      icon: FileTextIcon,
    },
    {
      title: 'API Keys',
      href: '/dashboard/api-keys',
      icon: KeyIcon,
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isItemActive = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.href} className="space-y-1">
        <Link href={item.href}>
          <Button
            variant={isItemActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              level > 0 && "ml-4",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("h-4 w-4", level > 0 && "h-3 w-3")} />
            {!isCollapsed && (
              <span className={cn("ml-2", level > 0 && "text-sm")}>
                {item.title}
              </span>
            )}
            {item.badge && !isCollapsed && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Button>
        </Link>
        
        {hasChildren && !isCollapsed && (
          <div className="space-y-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
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
            {navigation.map((item) => renderNavItem(item))}
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