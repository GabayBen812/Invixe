import { useMemo, useState } from 'react'
import { Modal } from './ui/modal'
import { Button } from './ui/button'
// Pull RN-web compatible components and app drills for 1:1 rendering
// Note: This relies on vite alias 'react-native' -> 'react-native-web'
import PageBackground from '../../../src/components/ui/PageBackground'
import MultiSelectDrill from '../../../src/components/lesson/MultiSelectDrill'
import CarouselSelectDrill from '../../../src/components/lesson/CarouselSelectDrill'
import SequenceBuildDrill from '../../../src/components/lesson/SequenceBuildDrill'
import SpeechBubble from '../../../src/components/lesson/SpeechBubble'
import { View, Text } from 'react-native'
import bg1 from '../../../src/assets/Lessons/1/lesson1_bg2.png'

interface Step { id: string; message: string; choices?: { text: string; nextStep: string }[]; activity?: string; activityConfig?: any }

export default function LiveLessonPreview({ open, onClose, steps }: { open: boolean; onClose: () => void; steps: Step[] }) {
  const byId = useMemo(() => Object.fromEntries((steps||[]).map(s => [s.id, s])), [steps])
  const [current, setCurrent] = useState<string>(steps?.[0]?.id || '')

  const step = byId[current] || steps?.[0]

  return (
    <Modal open={open} title="Lesson Preview" onClose={onClose}>
      <div className="grid grid-cols-[20rem_1fr] gap-4">
        <div className="max-h-[70vh] overflow-auto border rounded p-2 bg-slate-50">
          <div className="text-sm font-semibold mb-2">Steps</div>
          <div className="space-y-1">
            {steps.map(s => (
              <button key={s.id} className={`w-full text-left px-2 py-1 rounded ${current===s.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`} onClick={()=>setCurrent(s.id)}>
                {s.id} • {String(s.message||'').slice(0,40)}
              </button>
            ))}
          </div>
        </div>
        <div className="border rounded bg-slate-200 flex items-center justify-center">
          {step ? (
            <div className="w-[360px] h-[720px] rounded-[36px] overflow-hidden border border-slate-300 shadow bg-white">
              <div className="h-full">
                <div className="h-full">
                  <PageBackground source={bg1 as any}>
                    <View style={{ flex: 1, paddingTop: 32 }}>
                      <SpeechBubble message={step.message} disableTyping disableEnterAnim />
                      {step.activity === 'multiSelect' && (
                        <MultiSelectDrill
                          options={(step.activityConfig?.options||[]).map((o:any)=>({ id:o.id, label:o.label, correct:o.correct }))}
                          layout={step.activityConfig?.layout || 'grid'}
                          submitText={step.activityConfig?.submitText || 'בדוק'}
                          onSubmit={()=>{}}
                        />
                      )}
                      {step.activity === 'carouselSelect' && step.activityConfig?.carousel && (
                        <CarouselSelectDrill
                          items={step.activityConfig.carousel.items}
                          correctId={step.activityConfig.carousel.correctId}
                          submitText={step.activityConfig.carousel.submitText || 'אישור'}
                          onSubmit={()=>{}}
                        />
                      )}
                      {step.activity === 'sequenceBuild' && step.activityConfig?.sequenceBuild && (
                        <SequenceBuildDrill
                          slotsCount={step.activityConfig.sequenceBuild.slotsCount}
                          options={step.activityConfig.sequenceBuild.options}
                          correctSequence={step.activityConfig.sequenceBuild.correctSequence}
                          submitText={step.activityConfig.sequenceBuild.submitText || 'אישור'}
                          onSubmit={()=>{}}
                        />
                      )}
                    </View>
                  </PageBackground>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No step selected</div>
          )}
        </div>
      </div>
    </Modal>
  )
}


