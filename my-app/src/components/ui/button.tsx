"use client"

import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  variant?: string
  size?: string
}

export function Button({ children, asChild, className, ...props }: ButtonProps) {
  if (asChild) return <>{children}</>
  return (
    <button className={className} {...props}>
      {children}
    </button>
  )
}


