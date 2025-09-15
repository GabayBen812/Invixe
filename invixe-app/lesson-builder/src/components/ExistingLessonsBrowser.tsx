import { useEffect, useState } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'

interface LessonMeta { step: number; id: number }

export default function ExistingLessonsBrowser({ open, onClose, onCopy }: { open: boolean; onClose: () => void; onCopy: (meta: LessonMeta, steps: any[]) => void }) {
  const [lessons, setLessons] = useState<LessonMeta[]>([])
  const [selected, setSelected] = useState<LessonMeta | null>(null)
  const [stepsPreview, setStepsPreview] = useState<any[] | null>(null)

  useEffect(() => {
    if (!open) return
    fetch('/api/lessons').then(r=>r.json()).then(data => {
      setLessons((data.lessons || []).map((l:any) => ({ step: l.step, id: l.id })))
    }).catch(console.error)
  }, [open])

  const loadLesson = async (meta: LessonMeta) => {
    setSelected(meta)
    setStepsPreview(null)
    try {
      const res = await fetch(`/api/lesson?step=${meta.step}&id=${meta.id}`)
      const data = await res.json()
      setStepsPreview(data.steps || [])
    } catch (e) {
      console.error(e)
    }
  }

  const copyLesson = () => {
    if (selected && stepsPreview) onCopy(selected, stepsPreview)
  }

  return (
    <Modal open={open} title="Existing Lessons" onClose={onClose}>
      <div className="grid grid-cols-[14rem_1fr] gap-4">
        <div className="border rounded-md p-2 bg-slate-50 max-h-[60vh] overflow-auto">
          <div className="text-sm font-semibold mb-2">Lessons</div>
          <div className="space-y-1">
            {lessons.map(l => (
              <button key={`${l.step}-${l.id}`} className={`w-full text-left px-2 py-1 rounded ${selected && selected.step===l.step && selected.id===l.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`} onClick={() => loadLesson(l)}>
                Step {l.step} • {l.id}
              </button>
            ))}
          </div>
        </div>
        <div className="border rounded-md p-2 bg-white">
          <div className="text-sm font-semibold mb-2">Preview</div>
          {stepsPreview ? (
            <pre className="text-xs whitespace-pre-wrap break-words bg-slate-50 p-3 rounded border border-slate-200 max-h-[50vh] overflow-auto">{JSON.stringify(stepsPreview, null, 2)}</pre>
          ) : (
            <div className="text-slate-500 text-sm">Select a lesson to preview</div>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={copyLesson} disabled={!stepsPreview}>Start Copy Lesson</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}


