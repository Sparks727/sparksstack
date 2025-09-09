"use client"

import {
  IconDashboard,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconUser,
  IconBriefcase,
} from "@tabler/icons-react"
import Image from "next/image"
import { useOrganization } from "@clerk/nextjs"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from "@/components/ui/sidebar"

type AppSidebarProps = Omit<React.ComponentProps<typeof Sidebar>, 'children'> & { variant?: string }

export function AppSidebar({ variant, ...props }: AppSidebarProps) {
  const { isMobile, setIsOpen } = useSidebar()
  const { organization } = useOrganization()

  const handleLogoClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  // Different navigation items based on organization context
  const personalNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "My Projects", url: "/dashboard/projects", icon: IconBriefcase },
    { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
    { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
  ]

  const organizationNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Team Projects", url: "/dashboard/projects", icon: IconBriefcase },
    { title: "Team Members", url: "/dashboard/members", icon: IconUsers },
    { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
    { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
  ]

  const navItems = organization ? organizationNavItems : personalNavItems

  return (
    <div className="bg-[#1F1F23]">
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarContent>
          <div className="flex flex-col h-full">
            {/* Logo/Brand Section */}
            <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 px-6 bg-[#1F1F23]">
              <a href="/dashboard" className="flex items-center gap-2" onClick={handleLogoClick}>
                <Image 
                  src="/SparksStackLogo.png" 
                  alt="Sparks Stack Logo" 
                  width={24} 
                  height={24}
                  className="!size-6"
                />
                <span className="text-base font-semibold text-white">Sparks Stack</span>
              </a>
            </div>
            
            {/* Navigation Section */}
            <div className="flex-1 overflow-auto bg-[#1F1F23]">
              <NavMain items={navItems} />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
