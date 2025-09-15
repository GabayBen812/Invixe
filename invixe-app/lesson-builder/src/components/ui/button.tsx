import type { ButtonHTMLAttributes } from 'react'

type Variant = 'default' | 'secondary' | 'destructive' | 'ghost'

const variantClasses: Record<Variant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent hover:bg-slate-100',
}

export function Button({ className = '', variant = 'default', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-sm border border-transparent ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}


