"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "sm" | "md" }) {
  const { size, ...rest } = props as any
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-8",
        className
      )}
      {...rest}
    />
  )
}

export function SelectContent({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn("bg-popover text-popover-foreground z-50 overflow-hidden rounded-md border shadow-md", className)}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1" />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "focus:bg-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        className
      )}
      {...props}
    />
  )
}


