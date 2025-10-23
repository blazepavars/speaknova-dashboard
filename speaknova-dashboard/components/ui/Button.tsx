"use client"
import React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ className, variant='primary', size='md', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8888f2]/60 focus:ring-offset-[#09171a] disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }[size]
  const variants = {
    primary: 'bg-[var(--primary)] text-[#0b0b12] hover:brightness-110',
    outline: 'border border-[#2b3e44] text-[var(--text)] hover:bg-[#0f2730]',
    ghost: 'text-[var(--text)] hover:bg-[#0f2730]'
  }[variant]
  return <button className={clsx(base, sizes, variants, className)} {...props} />
}

