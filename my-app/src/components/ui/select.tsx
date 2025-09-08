"use client"

import * as React from "react"

type SelectContextValue = {
  value: string | undefined
  setValue: (v: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export function Select({ value, onValueChange, children, defaultValue }: { value?: string; defaultValue?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
  return (
    <SelectContext.Provider value={{ value: value ?? defaultValue, setValue: (v) => onValueChange?.(v) }}>
      {children}
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: string }) {
  return (
    <button className={className} data-size={size} {...props}>
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return <span data-slot="select-value">{ctx?.value ?? placeholder}</span>
}

export function SelectContent({ children, className, side, align }: { children: React.ReactNode; className?: string; side?: string; align?: string }) {
  return <div className={className} data-side={side} data-align={align}>{children}</div>
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SelectContext)
  return (
    <button className={className} onClick={() => ctx?.setValue(value)}>
      {children}
    </button>
  )
}


