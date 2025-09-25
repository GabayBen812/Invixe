import React, { useState, ReactNode } from 'react'

export function Accordion({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-2 ${className}`}>{children}</div>
}

export function AccordionItem({ title, children, defaultOpen = false }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState<boolean>(defaultOpen)
  return (
    <div className="rounded-lg bg-white shadow-sm border border-slate-200">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <div className="font-medium text-slate-800 truncate pr-3">{title}</div>
        <span className="text-slate-500">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="border-t border-slate-200 p-4">{children}</div>}
    </div>
  )
}


