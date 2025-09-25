import React, { ReactNode } from 'react'

export function BottomToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 p-3">
      <div className="max-w-6xl mx-auto flex items-center justify-end gap-2">
        {children}
      </div>
    </div>
  )
}


