"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "@/lib/utils"

export function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { variant?: "outline" }) {
  const { variant, ...rest } = props as any
  return (
    <ToggleGroupPrimitive.Root
      className={cn("inline-flex items-center gap-1 rounded-md border p-1", className)}
      {...rest}
    />
  )
}

export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground rounded-sm px-2 py-1 text-sm",
        className
      )}
      {...props}
    />
  )}


