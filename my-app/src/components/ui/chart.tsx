"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<string, { label?: string; color?: string }>

export function ChartContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { config: ChartConfig }) {
  return <div className={cn("w-full", className)} {...props} />
}

export function ChartTooltip({ ...props }: any) {
  // passthrough wrapper for Recharts Tooltip
  // Use directly as <ChartTooltip content={<ChartTooltipContent />} />
  return null
}

export function ChartTooltipContent({ labelFormatter, indicator = "dot" }: { labelFormatter?: (label: string) => string; indicator?: "dot" | "line" }) {
  // Placeholder; actual tooltip UI is commonly implemented inline.
  return null
}


