"use client"

import * as React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Checkbox(props: Props) {
  return <input type="checkbox" {...props} />
}


