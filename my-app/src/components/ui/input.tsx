"use client"

import * as React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Input(props: Props) {
  return <input {...props} />
}


