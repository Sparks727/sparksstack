"use client"

import * as React from "react"

export function ToggleGroup({ value, onValueChange, children, className }: { value?: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string; type?: string; variant?: string }) {
  return <div className={className}>{children}</div>
}

export function ToggleGroupItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <button data-value={value}>{children}</button>
}


