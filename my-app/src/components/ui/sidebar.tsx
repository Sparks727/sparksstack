"use client"

import * as React from "react"

type SidebarContextValue = {
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue>({ isMobile: false })

export function SidebarProvider({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <SidebarContext.Provider value={{ isMobile: false }}>
      <div style={style} data-collapsible="expanded" className="sidebar-wrapper">
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
    <aside data-collapsible={collapsible} className="sidebar">
      {children}
    </aside>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-header">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-content">{children}</div>
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="sidebar-footer">{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="sidebar-menu">{children}</ul>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li className="sidebar-menu-item">{children}</li>
}

export function SidebarMenuButton({ children, asChild, className, size }: { children: React.ReactNode; asChild?: boolean; className?: string; size?: string }) {
  if (asChild) return <>{children}</>
  return (
    <button className={className} data-size={size}>
      {children}
    </button>
  )
}

// Extra shims used by nav components
export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={className}>{children}</div> }
export function SidebarGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={className}>{children}</div> }
export function SidebarGroupContent({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={className}>{children}</div> }
export function SidebarMenuAction({ children }: { children: React.ReactNode }) { return <button>{children}</button> }

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <main className="sidebar-inset">{children}</main>
}

export function SidebarTrigger({ className }: { className?: string }) {
  return <button className={className} aria-label="Toggle sidebar">☰</button>
}


