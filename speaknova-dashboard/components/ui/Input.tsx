"use client"
import React from 'react'
import clsx from 'clsx'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: Props) {
  return (
    <input
      className={clsx('bg-[#0d2126] border border-[#123239] rounded-md px-3 py-2 text-[var(--text)] placeholder:text-[#6e7d82] focus:outline-none focus:ring-2 focus:ring-[#8888f2]/50', className)}
      {...props}
    />
  )
}

