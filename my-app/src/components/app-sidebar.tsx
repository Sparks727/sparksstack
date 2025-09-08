"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Sidebar as UiSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { BuildingIcon, HomeIcon, UserIcon, BookOpenIcon } from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: NavItem[] = [
  { title: "Get Started", href: "/dashboard/get-started", icon: BookOpenIcon },
  { title: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { title: "Organizations", href: "/dashboard/organizations", icon: BuildingIcon },
  { title: "Profile", href: "/dashboard/profile", icon: UserIcon },
];

import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar(props: React.ComponentProps<typeof UiSidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <UiSidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Image
            src="/SparksStackLogo.png"
            alt="Sparks Stack"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
          <span className="text-sm font-semibold">Sparks Stack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (isMobile) {
                            // Close the mobile sheet after navigation
                            // Delay to allow navigation to start
                            setTimeout(() => setOpenMobile(false), 0);
                          }
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </UiSidebar>
  );
}


