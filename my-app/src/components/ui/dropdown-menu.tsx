"use client"

import * as React from "react"

export function DropdownMenu({ children }: { children: React.ReactNode }) { return <>{children}</> }
export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) { return asChild ? <>{children}</> : <button>{children}</button> }
export function DropdownMenuContent({ children, className, side, align, sideOffset }: { children: React.ReactNode; className?: string; side?: string; align?: string; sideOffset?: number }) { return <div className={className} data-side={side} data-align={align} data-offset={sideOffset}>{children}</div> }
export function DropdownMenuGroup({ children }: { children: React.ReactNode }) { return <div>{children}</div> }
export function DropdownMenuItem({ children, variant }: { children: React.ReactNode; variant?: string }) { return <button data-variant={variant}>{children}</button> }
export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={className}>{children}</div> }
export function DropdownMenuSeparator() { return <div /> }
export function DropdownMenuCheckboxItem({ children, className, checked, onCheckedChange }: { children: React.ReactNode; className?: string; checked?: boolean; onCheckedChange?: (v: boolean) => void }) { return <button className={className} onClick={() => onCheckedChange?.(!checked)}>{children}</button> }


