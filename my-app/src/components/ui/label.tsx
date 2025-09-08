"use client"

import * as React from "react"

type Props = React.LabelHTMLAttributes<HTMLLabelElement>

export function Label({ children, ...props }: Props) {
  return <label {...props}>{children}</label>
}


