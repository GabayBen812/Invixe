import { useEffect, useMemo, useState } from 'react'
import TemplateGallery from './components/TemplateGallery.tsx'
import LessonBuilder from './components/LessonBuilder.tsx'
import { Button } from './components/ui/button'
import { Download, Upload, Eye, Save } from 'lucide-react'
import { useI18n } from './context/i18n.tsx'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select } from './components/ui/select'
import { BottomToolbar } from './components/ui/toolbar'
import { Modal } from './components/ui/modal'
import ExistingLessonsBrowser from './components/ExistingLessonsBrowser.tsx'
import LiveLessonPreview from './components/LiveLessonPreview.tsx'

function App() {
  const [steps, setSteps] = useState<any[]>([])
  const { t, lang, setLang } = useI18n()

  // Lesson settings (always visible)
  const [title, setTitle] = useState('')
  const [courseStep, setCourseStep] = useState('1')
  const [lessonId, setLessonId] = useState('')
  const [position, setPosition] = useState('')
  const [started, setStarted] = useState(false)

  // Sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Preview modal
  const [showPreview, setShowPreview] = useState(false)
  const [showExisting, setShowExisting] = useState(false)
  const [showLivePreview, setShowLivePreview] = useState(false)

  // Restore draft
  useEffect(() => {
    const draft = localStorage.getItem('lesson_draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setTitle(parsed.title || '')
        setCourseStep(String(parsed.courseStep || '1'))
        setLessonId(String(parsed.lessonId || ''))
        setPosition(String(parsed.position || ''))
        setSteps(Array.isArray(parsed.steps) ? parsed.steps : [])
        setStarted(!!parsed.started)
      } catch {}
    }
  }, [])

  // Persist settings quickly
  useEffect(() => {
    const data = { title, courseStep, lessonId, position, steps, started: true }
    localStorage.setItem('lesson_draft', JSON.stringify(data))
  }, [title, courseStep, lessonId, position, steps])

  const saveDraft = () => {
    localStorage.setItem('lesson_draft', JSON.stringify({ title, courseStep, lessonId, position, steps, started: true }))
  }

  const addStep = (template: any) => {
    setSteps(prev => [...prev, { ...template.defaultData }])
    setStarted(true)
  }

  const updateStep = (index: number, newData: any) => {
    setSteps(prev => prev.map((s, i) => i === index ? newData : s))
  }

  const jsonString = useMemo(() => JSON.stringify(steps, null, 2), [steps])

  const exportJSON = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lesson.json'
    a.click()
  }

  const exportToApp = async () => {
    if (!courseStep || !lessonId || steps.length === 0) { alert('Please fill lesson settings and add at least one step.'); return }
    try {
      const API_BASE = (import.meta as any).env?.VITE_BUILDER_API_URL || window.location.origin
      const url = `${String(API_BASE).replace(/\/$/, '')}/api/exportLesson`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: Number(courseStep), lessonId: Number(lessonId), title: title || 'New Lesson', steps })
      })
      if (!res.ok) throw new Error(await res.text())
      alert('Exported to app successfully.')
    } catch (e) {
      alert('Failed to export to app. See console.')
      console.error(e)
    }
  }

  const handleCopyExisting = (meta: { step: number; id: number }, s: any[]) => {
    setCourseStep(String(meta.step))
    setLessonId(String(meta.id))
    setSteps(s)
    setStarted(true)
    setShowExisting(false)
  }

  const showOnboarding = !started

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="text-slate-700 font-semibold">Invixe Lesson Builder</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowExisting(true)}>Browse Existing</Button>
            <Button variant={lang === 'en' ? 'default' : 'secondary'} onClick={() => setLang('en')}>EN</Button>
            <Button variant={lang === 'he' ? 'default' : 'secondary'} onClick={() => setLang('he')}>HE</Button>
          </div>
        </div>
        {/* Always-visible lesson settings */}
        <div className="mt-3 rounded-xl bg-white shadow-sm border border-slate-200 p-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1 block">{t('lessonTitle')}</Label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Candlestick Basics" aria-label="Lesson Title" />
            </div>
            <div>
              <Label className="mb-1 block">{t('courseStep')}</Label>
              <Select value={courseStep} onChange={e=>setCourseStep(e.target.value)} aria-label="Course Step">
                <option value="1">Step 1</option>
                <option value="2">Step 2</option>
                <option value="3">Step 3</option>
                <option value="4">Step 4</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">{t('lessonId')}</Label>
              <Input value={lessonId} onChange={e=>setLessonId(e.target.value)} placeholder="e.g., 205" aria-label="Lesson ID" />
            </div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-[18rem_1fr] gap-4 p-4 h-[calc(100vh-156px)] overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block h-full overflow-y-auto pr-2`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{t('templates')}</h3>
            <Button variant="secondary" onClick={() => setSidebarOpen(o=>!o)}>{sidebarOpen ? t('hide') : t('show')}</Button>
          </div>
          <TemplateGallery onSelect={addStep} />
        </div>

        {/* Main */}
        <div className="relative h-full overflow-hidden">
          {showOnboarding ? (
            <div className="h-full grid place-items-center">
              <div className="w-[min(95%,640px)] rounded-xl bg-white shadow-sm border border-slate-200 p-6">
                <div className="text-xl font-semibold mb-4">{t('startNewLesson')}</div>
                <div className="grid gap-3">
                  <div>
                    <Label className="mb-1 block">{t('lessonTitle')}</Label>
                    <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Candlestick Basics" aria-label="Lesson Title" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-1 block">{t('courseStep')}</Label>
                      <Select value={courseStep} onChange={e=>setCourseStep(e.target.value)} aria-label="Course Step">
                        <option value="1">Step 1</option>
                        <option value="2">Step 2</option>
                        <option value="3">Step 3</option>
                        <option value="4">Step 4</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1 block">{t('lessonId')}</Label>
                      <Input value={lessonId} onChange={e=>setLessonId(e.target.value)} placeholder="e.g., 205" aria-label="Lesson ID" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={saveDraft}><Save size={16}/> {t('saveDraft')}</Button>
                    <Button onClick={() => { setStarted(true); saveDraft() }}>{t('startBuilding')}</Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <LessonBuilder steps={steps} onUpdate={updateStep} />
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <BottomToolbar>
        <Button variant="secondary" onClick={saveDraft} aria-label={t('saveDraft')}><Save size={16}/> {t('saveDraft')}</Button>
        <Button variant="secondary" onClick={() => setShowLivePreview(true)} aria-label="Preview Lesson"><Eye size={16}/> Preview Lesson</Button>
        <Button variant="secondary" onClick={() => setShowPreview(true)} aria-label={t('previewJson')}><Eye size={16}/> {t('previewJson')}</Button>
        <Button onClick={exportJSON} aria-label={t('exportJson')}><Download size={16} /> {t('exportJson')}</Button>
        <Button onClick={exportToApp} aria-label={t('exportToApp')}><Upload size={16} /> {t('exportToApp')}</Button>
      </BottomToolbar>

      {/* Preview modal */}
      <Modal open={showPreview} title="Lesson JSON" onClose={() => setShowPreview(false)}>
        <pre className="text-xs whitespace-pre-wrap break-words bg-slate-50 p-3 rounded border border-slate-200 max-h-[60vh] overflow-auto">{jsonString}</pre>
      </Modal>

      <ExistingLessonsBrowser open={showExisting} onClose={() => setShowExisting(false)} onCopy={handleCopyExisting} />
      <LiveLessonPreview open={showLivePreview} onClose={() => setShowLivePreview(false)} steps={steps} />
    </div>
  )
}

export default App
