"use client"

import * as React from "react"

export function Drawer({ children, direction }: { children: React.ReactNode; direction?: string }) {
  return <div data-direction={direction}>{children}</div>
}

export function DrawerContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerFooter({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function DrawerTitle({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function DrawerTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return asChild ? <>{children}</> : <button>{children}</button>
}

export function DrawerClose({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return asChild ? <>{children}</> : <button>{children}</button>
}


