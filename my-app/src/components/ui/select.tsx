"use client"

import * as React from "react"

type SelectContextValue = {
  value: string | undefined
  setValue: (v: string) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export function Select({ value, onValueChange, children }: { value?: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <SelectContext.Provider value={{ value, setValue: onValueChange }}>
      {children}
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: string }) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return <span data-slot="select-value">{ctx?.value ?? placeholder}</span>
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SelectContext)
  return (
    <button className={className} onClick={() => ctx?.setValue(value)}>
      {children}
    </button>
  )
}


