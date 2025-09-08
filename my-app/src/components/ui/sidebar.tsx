"use client"

import * as React from "react"

type SidebarContextValue = {
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({ isMobile: false })

export function SidebarProvider({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <SidebarContext.Provider value={{ isMobile: false }}>
      <div style={style} data-collapsible="expanded" className="group/sidebar-wrapper flex min-h-svh w-full has-data-[collapsible=icon]:sidebar-icon">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function Sidebar({ children, collapsible }: { children: React.ReactNode; collapsible?: string }) {
  return (
    <aside data-collapsible={collapsible} className="group/sidebar peer hidden w-0 shrink-0 transition-[width] duration-300 ease-linear group-data-[collapsible=offcanvas]:fixed group-data-[collapsible=offcanvas]:inset-y-0 group-data-[collapsible=offcanvas]:z-50 group-data-[collapsible=offcanvas]:w-72 group-data-[collapsible=offcanvas]:border-r group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:shadow-lg group-data-[collapsible=offcanvas]:will-change-transform group-data-[collapsible=offcanvas]:peer-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:peer-data-[collapsible=offcanvas]:duration-300 group-data-[collapsible=offcanvas]:peer-data-[collapsible=offcanvas]:ease-linear group-data-[collapsible=offcanvas]:peer-data-[collapsible=offcanvas]:[&:not([data-state=open])]:-translate-x-full group-data-[collapsible=offcanvas]:peer-data-[collapsible=offcanvas]:[&:not([data-state=open])]:will-change-transform group-data-[collapsible=offcanvas]:peer-data-[collapsible=offcanvas]:[&:not([data-state=open])]:[transform:translate3d(-100%,0,0)] has-data-[collapsible=icon]:w-16 lg:flex lg:w-72 lg:border-r lg:bg-sidebar lg:shadow-lg">
      {children}
    </aside>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-6">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">{children}</div>
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2 border-t border-sidebar-border p-2">{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="flex w-full min-w-0 flex-col gap-1 p-2">{children}</ul>
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={className ?? "group/menu-item relative"}>{children}</li>
}

export function SidebarMenuButton({ children, asChild, className, size, tooltip }: { children: React.ReactNode; asChild?: boolean; className?: string; size?: string; tooltip?: string }) {
  if (asChild) return <>{children}</>
  return (
    <button className={`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[collapsible=icon]/sidebar-wrapper:!size-8 group-has-data-[collapsible=icon]/sidebar-wrapper:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 ${className ?? ""}`} data-size={size} title={tooltip}>
      {children}
    </button>
  )
}

// Extra shims used by nav components
export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={`group/sidebar-group relative flex w-full min-w-0 flex-col p-2 ${className ?? ""}`}>{children}</div> }
export function SidebarGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={`flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-all ${className ?? ""}`}>{children}</div> }
export function SidebarGroupContent({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={`w-full text-sm ${className ?? ""}`}>{children}</div> }
export function SidebarMenuAction({ children, className, showOnHover }: { children: React.ReactNode; className?: string; showOnHover?: boolean }) { return <button className={`absolute right-1 top-1 flex size-6 shrink-0 items-center justify-center rounded-md outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-data-[collapsible=icon]/sidebar-wrapper:!size-8 group-has-data-[collapsible=icon]/sidebar-wrapper:!p-2 [&>svg]:size-4 [&>svg]:shrink-0 ${className ?? ""}`} data-show-on-hover={showOnHover}>{children}</button> }

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <main className="group/sidebar-inset relative flex min-h-svh flex-1 flex-col bg-background">{children}</main>
}

export function SidebarTrigger({ className }: { className?: string }) {
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${className ?? ""}`} aria-label="Toggle sidebar">☰</button>
}


