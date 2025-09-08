import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import Image from "next/image"

export default function Page() {
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
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="relative">
              <Image 
                src="/SparksStackLogo.png" 
                alt="SparksStack Logo" 
                width={200} 
                height={200}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                SparksStack
              </h1>
              <p className="text-xl text-muted-foreground">
                Dashboard is coming soon
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                We're working hard to bring you an amazing dashboard experience. 
                Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
