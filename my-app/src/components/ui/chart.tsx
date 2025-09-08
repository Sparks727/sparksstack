"use client"

import * as React from "react"

export type ChartConfig = Record<string, { label?: string; color?: string }>

export function ChartContainer({ children, className }: { children: React.ReactNode; className?: string; config?: ChartConfig }) {
  return <div className={className}>{children}</div>
}

export function ChartTooltip({ children }: { children?: React.ReactNode; cursor?: boolean; content?: React.ReactNode }) {
  return <>{children ?? null}</>
}

export function ChartTooltipContent({ labelFormatter }: { labelFormatter?: (value: any) => string; indicator?: string }) {
  return <div data-label={labelFormatter ? labelFormatter("") : ""} />
}


