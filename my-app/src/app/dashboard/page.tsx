"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useOrganization, useUser } from "@clerk/nextjs"
import Image from "next/image"

// Personal Dashboard Component
function PersonalDashboard() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="relative">
        <Image 
          src="/SparksStackLogo.png" 
          alt="Sparks Stack Logo" 
          width={200} 
          height={200}
          className="rounded-lg shadow-lg"
        />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">
          Personal Dashboard
        </h1>
        <p className="text-xl text-white">
          Welcome to your personal Sparks Stack workspace
        </p>
        <p className="text-sm text-gray-300 max-w-md">
          Manage your personal projects, track your progress, and access your individual tools and resources.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">My Projects</h3>
            <p className="text-gray-300 text-sm">Track and manage your personal projects</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Personal Analytics</h3>
            <p className="text-gray-300 text-sm">View your individual performance metrics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Organization Dashboard Component
function OrganizationDashboard({ organization }: { organization: any }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="relative">
        <Image 
          src="/SparksStackLogo.png" 
          alt="Sparks Stack Logo" 
          width={200} 
          height={200}
          className="rounded-lg shadow-lg"
        />
      </div>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">
          {organization.name} Dashboard
        </h1>
        <p className="text-xl text-white">
          Organization workspace for {organization.name}
        </p>
        <p className="text-sm text-gray-300 max-w-md">
          Collaborate with your team, manage organization-wide projects, and access shared resources and tools.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Team Projects</h3>
            <p className="text-gray-300 text-sm">Collaborate on organization projects</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Team Members</h3>
            <p className="text-gray-300 text-sm">Manage your organization members</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Org Analytics</h3>
            <p className="text-gray-300 text-sm">View organization-wide metrics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { user, isLoaded: userLoaded } = useUser()

  // Show loading state while Clerk is loading
  if (!orgLoaded || !userLoaded) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="bg-[#1F1F23] min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading dashboard...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="bg-[#1F1F23] min-h-screen">
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center bg-[#1F1F23] p-8">
            {organization ? (
              <OrganizationDashboard organization={organization} />
            ) : (
              <PersonalDashboard />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
