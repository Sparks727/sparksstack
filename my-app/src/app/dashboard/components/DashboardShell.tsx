"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  Home,
  Map,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  Star,
  X,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"

// Define navigation items with icons and paths
const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Locations", href: "/dashboard/locations", icon: Map },
  { name: "Reviews", href: "/dashboard/reviews", icon: Star },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname() || ""
  const { user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:max-w-xs">
              <div className="flex h-full flex-col">
                <div className="px-2 py-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl font-bold text-blue-500">SparksStack</span>
                  </Link>
                </div>
                <nav className="grid gap-1 px-2">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                          isActive 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto p-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Logo */}
          <Link href="/dashboard" className="hidden lg:flex items-center gap-2">
            <span className="text-xl font-bold text-blue-500">SparksStack</span>
          </Link>
        </div>
        
        {/* Search */}
        <div className="relative hidden md:flex flex-1 items-center gap-4 md:gap-6 lg:gap-8">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 md:w-2/3 lg:w-1/3"
            />
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          {user && <UserButton afterSignOutUrl="/" />}
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r w-64 shrink-0">
          <div className="flex h-full flex-col gap-2">
            <nav className="grid gap-1 px-2 py-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto p-4 text-xs text-muted-foreground">
              <p>© 2024 SparksStack</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 