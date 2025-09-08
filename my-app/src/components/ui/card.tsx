"use client"

import * as React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, children, ...props }: DivProps) {
  return (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className ?? ""}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: DivProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className ?? ""}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: DivProps) {
  return (
    <h3 className={`font-semibold leading-none tracking-tight ${className ?? ""}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: DivProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className ?? ""}`} {...props}>
      {children}
    </p>
  )
}

export function CardAction({ className, children, ...props }: DivProps) {
  return (
    <div className={`ml-auto ${className ?? ""}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: DivProps) {
  return (
    <div className={`p-6 pt-0 ${className ?? ""}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: DivProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className ?? ""}`} {...props}>
      {children}
    </div>
  )
}


