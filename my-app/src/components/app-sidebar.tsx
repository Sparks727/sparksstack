"use client"

import * as React from "react"
import {
  IconDashboard,
} from "@tabler/icons-react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  ],
  navClouds: [],
  navSecondary: [],
  documents: [],
}

type AppSidebarProps = Omit<React.ComponentProps<typeof Sidebar>, 'children'> & { variant?: string }

export function AppSidebar({ variant, ...props }: AppSidebarProps) {
  const { isMobile, setIsOpen } = useSidebar()

  const handleLogoClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* Logo/Brand Section */}
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-6">
            <a href="/dashboard" className="flex items-center gap-2" onClick={handleLogoClick}>
              <Image 
                src="/SparksStackLogo.png" 
                alt="SparksStack Logo" 
                width={24} 
                height={24}
                className="!size-6"
              />
              <span className="text-base font-semibold">SparksStack</span>
            </a>
          </div>
          
          {/* Navigation Section */}
          <div className="flex-1 overflow-auto">
            <NavMain items={data.navMain} />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
