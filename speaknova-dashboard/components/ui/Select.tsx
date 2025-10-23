"use client"
import React from 'react'
import clsx from 'clsx'

type Props = React.SelectHTMLAttributes<HTMLSelectElement>

export default function Select({ className, children, ...props }: Props) {
  return (
    <select
      className={clsx('bg-[#0d2126] border border-[#123239] rounded-md px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#8888f2]/50', className)}
      {...props}
    >
      {children}
    </select>
  )
}

