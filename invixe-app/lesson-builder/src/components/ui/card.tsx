import type { ReactNode } from 'react'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-lg bg-white shadow-sm border border-slate-200 ${className}`}>{children}</div>
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`p-4 border-b border-slate-200 ${className}`}>{children}</div>
}

export function CardContent({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}


