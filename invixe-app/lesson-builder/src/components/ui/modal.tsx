import type { ReactNode } from 'react'
import { Button } from './button'

export function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[min(90vw,860px)] max-h-[80vh] overflow-auto rounded-lg bg-white shadow-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="font-semibold text-slate-800">{title}</div>
          <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}


