"use client"

import * as React from "react"

export function Tabs({ children, defaultValue, className }: { children: React.ReactNode; defaultValue?: string; className?: string }) { return <div className={className} data-default={defaultValue}>{children}</div> }
export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={className}>{children}</div> }
export function TabsTrigger({ children, value }: { children: React.ReactNode; value?: string }) { return <button data-value={value}>{children}</button> }
export function TabsContent({ children, value, className }: { children: React.ReactNode; value?: string; className?: string }) { return <div className={className} data-value={value}>{children}</div> }


