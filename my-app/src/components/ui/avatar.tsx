"use client"

import * as React from "react"

export function Avatar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} className={className} />
}

export function AvatarFallback({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}


