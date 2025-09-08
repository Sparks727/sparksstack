"use client"

import * as React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: DivProps) {
  return (
    <h3 className={className} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: DivProps) {
  return (
    <p className={className} {...props}>
      {children}
    </p>
  )
}

export function CardAction({ className, children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}


