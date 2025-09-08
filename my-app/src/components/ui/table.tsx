"use client"

import * as React from "react"

export function Table({ children, className }: { children: React.ReactNode; className?: string }) { return <table className={className}>{children}</table> }
export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) { return <thead className={className}>{children}</thead> }
export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) { return <tbody className={className}>{children}</tbody> }
export function TableRow({ children, className, ref, style, ...rest }: { children: React.ReactNode; className?: string; ref?: any; style?: React.CSSProperties }) { return <tr className={className} style={style} {...rest}>{children}</tr> }
export function TableHead({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) { return <th colSpan={colSpan}>{children}</th> }
export function TableCell({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) { return <td className={className} colSpan={colSpan}>{children}</td> }


