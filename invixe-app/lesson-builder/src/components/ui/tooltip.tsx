import type { ReactNode } from 'react'
import { useState } from 'react'

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-10 -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-slate-800 text-white text-xs px-2 py-1 shadow">
          {content}
        </span>
      )}
    </span>
  )
}


