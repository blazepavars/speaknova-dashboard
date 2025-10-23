import React from 'react'
import clsx from 'clsx'

export default function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-[#0f2730] border border-[#1d3a43]', className)} {...props} />
}

