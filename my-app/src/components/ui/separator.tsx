"use client"

export function Separator({ className, orientation }: { className?: string; orientation?: "horizontal" | "vertical" }) {
  return <div className={className} data-orientation={orientation} />
}


