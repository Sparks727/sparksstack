"use client"

import * as React from "react"

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked'> & {
  checked?: boolean | "indeterminate"
  onCheckedChange?: (value: boolean | "indeterminate") => void
}

export function Checkbox({ checked, onCheckedChange, ...rest }: Props) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = checked === "indeterminate"
    }
  }, [checked])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked === true}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...rest}
    />
  )
}


