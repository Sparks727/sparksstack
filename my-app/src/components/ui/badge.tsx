"use client"

import * as React from "react"

export function Badge({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) {
  return <span className={className} data-variant={variant}>{children}</span>
}


