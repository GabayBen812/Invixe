import { useMemo, useState } from 'react'
import { Modal } from './ui/modal'
import { View } from 'react-native'
// Use app components directly to mirror exact UI
import PageBackground from '@app/components/ui/PageBackground'
import MultiSelectDrill from '@app/components/lesson/MultiSelectDrill'
// import CarouselSelectDrill from '@app/components/lesson/CarouselSelectDrill' // Using mock instead
// import SequenceBuildDrill from '@app/components/lesson/SequenceBuildDrill' // Using mock instead
import SpeechBubble from '@app/components/lesson/SpeechBubble'
import Bg from '@app/assets/DefaultBlankBackground.png'
import { BullishCandleSVG, BearishCandleSVG, DojiCandleSVG, HammerCandleSVG } from '@app/components/lesson/CandlestickSVGs'
import { DragonflyDoji, InvertedHammerNew, RegularDoji, ShootingStar, Hammer, BullishEngulfing, BearishEngulfing } from '@app/assets/Candels'
import MockDialog from './mocks/MockDialog'
import MockDragMatchDrill from './mocks/MockDragMatchDrill'
import MockQuestionWithImage from './mocks/MockQuestionWithImage'
import MockTopBar from './mocks/MockTopBar.tsx'
import MockBottomNavbar from './mocks/MockBottomNavbar.tsx'
import MockProgressBar from './mocks/MockProgressBar.tsx'

interface Step { id: string; message: string; choices?: { text: string; nextStep: string }[]; activity?: string; activityConfig?: any }

export default function LiveLessonPreview({ open, onClose, steps }: { open: boolean; onClose: () => void; steps: Step[] }) {
  const byId = useMemo(() => Object.fromEntries((steps||[]).map(s => [s.id, s])), [steps])
  const [current, setCurrent] = useState<string>(steps?.[0]?.id || '')
  // no dynamic import; we import the real components above

  const step = byId[current] || steps?.[0]
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [sequenceSlots, setSequenceSlots] = useState<(string | undefined)[]>([])
  const toggle = (id:string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  // components are imported statically above – no runtime loader needed

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
            <div className="w-[390px] h-[844px] rounded-[36px] overflow-hidden border border-slate-300 shadow bg-white">
              <div className="h-full">
                <div className="h-full">
                  <PageBackground source={{ uri: (Bg as unknown as string) } as any}>
                    <View style={{ flex: 1 }}>
                      <MockTopBar />
                      <View style={{ flex: 1, paddingTop: 12, paddingHorizontal: 12 }}>
                      <SpeechBubble message={step.message} position="topRight" align="flex-end" disableTyping disableEnterAnim />
                      <div className="flex flex-col flex-1" >
                      {step.activity === 'multiSelect' && (
                        (() => {
                          const opts = (step.activityConfig?.options||[]) as any[]
                          const hasCandleKey = opts.some(o => o.imageKey)
                          if (hasCandleKey) {
                            return (
                              <div className="px-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {opts.map((o:any) => (
                                    <button key={o.id} className={`flex flex-col items-center justify-center rounded-2xl transition-shadow ${selected[o.id] ? 'ring-4 ring-blue-400' : ''}`} onClick={()=>toggle(o.id)}>
                                      <div className="flex items-center justify-center" style={{ width: 120, height: 120 }}>
                                        {o.imageKey === 'bullish' && <BullishCandleSVG width={40} height={120} />}
                                        {o.imageKey === 'bearish' && <BearishCandleSVG width={40} height={120} />}
                                        {o.imageKey === 'doji' && <DojiCandleSVG width={60} height={100} />}
                                        {o.imageKey === 'hammer' && <HammerCandleSVG width={60} height={120} />}
                                      </div>
                                      {o.label ? <div className="mt-2 text-[16px] font-bold text-slate-800">{o.label}</div> : null}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex justify-center mt-5">
                                  <button className="inline-flex items-center justify-center rounded-2xl bg-[#3F9FFF] px-6 py-3 text-sm font-extrabold text-white shadow-sm">
                                    {step.activityConfig?.submitText || 'בדוק'}
                                  </button>
                                </div>
                              </div>
                            )
                          }
                          return (
                            <MultiSelectDrill
                              options={opts.map((o:any)=>({ id:o.id, label:o.label, correct:o.correct }))}
                              layout={step.activityConfig?.layout || 'grid'}
                              submitText={step.activityConfig?.submitText || 'בדוק'}
                              onSubmit={()=>{}}
                            />
                          )
                        })()
                      )}
                      {step.activity === 'carouselSelect' && step.activityConfig?.carousel && (() => {
                        const items = step.activityConfig.carousel.items || []
                        const currentItem = items[carouselIndex] || items[0]
                        
                        const goLeft = () => setCarouselIndex(prev => (prev - 1 + items.length) % items.length)
                        const goRight = () => setCarouselIndex(prev => (prev + 1) % items.length)
                        
                        if (items.length === 0) return null
                        
                        return (
                          <div className="px-4">
                            <div className="flex items-center justify-center gap-4">
                              <button 
                                onClick={goLeft}
                                className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm"
                              >
                                <span className="text-3xl font-extrabold text-slate-800">‹</span>
                              </button>
                              
                              <div className="w-[210px] h-[210px] rounded-full bg-blue-50 flex flex-col items-center justify-center">
                                {currentItem?.imageKey && (
                                  <div className="w-[90px] h-[140px] flex items-center justify-center">
                                    {/* Character images would go here - you can add character SVGs if needed */}
                                    <div className="w-full h-full bg-gradient-to-b from-blue-200 to-blue-300 rounded-lg flex items-center justify-center">
                                      <span className="text-blue-600 font-bold text-sm">{currentItem.imageKey}</span>
                                    </div>
                                  </div>
                                )}
                                {currentItem?.label && (
                                  <div className="mt-2 text-base font-bold text-slate-800">{currentItem.label}</div>
                                )}
                              </div>
                              
                              <button 
                                onClick={goRight}
                                className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm"
                              >
                                <span className="text-3xl font-extrabold text-slate-800">›</span>
                              </button>
                            </div>
                            
                            <div className="flex justify-center mt-5">
                              <button className="inline-flex items-center justify-center rounded-2xl bg-[#3F9FFF] px-7 py-3 text-lg font-extrabold text-white shadow-sm">
                                {step.activityConfig.carousel.submitText || 'אישור'}
                              </button>
                            </div>
                          </div>
                        )
                      })()}
                      {step.activity === 'sequenceBuild' && step.activityConfig?.sequenceBuild && (() => {
                        const { slotsCount, options } = step.activityConfig.sequenceBuild
                        const slots = Array(slotsCount || 2).fill(undefined)
                        
                        // Initialize sequence slots if not already set
                        if (sequenceSlots.length !== slotsCount) {
                          setSequenceSlots(Array(slotsCount).fill(undefined))
                        }
                        
                        const placeInSlot = (optionId: string, slotIndex: number) => {
                          setSequenceSlots(prev => {
                            const newSlots = [...prev]
                            newSlots[slotIndex] = optionId
                            return newSlots
                          })
                        }
                        
                        const removeFromSlot = (slotIndex: number) => {
                          setSequenceSlots(prev => {
                            const newSlots = [...prev]
                            newSlots[slotIndex] = undefined
                            return newSlots
                          })
                        }
                        
                        const getCandleComponent = (candleKey: string) => {
                          switch (candleKey) {
                            case 'bullish': return <BullishCandleSVG width={36} height={110} />
                            case 'bearish': return <BearishCandleSVG width={36} height={110} />
                            case 'doji': return <DojiCandleSVG width={40} height={110} />
                            case 'hammer': return <Hammer width={40} height={120} />
                            case 'invertedHammerNew': return <InvertedHammerNew width={40} height={120} />
                            case 'dragonflyDoji': return <DragonflyDoji width={40} height={110} />
                            case 'regularDoji': return <RegularDoji width={40} height={110} />
                            case 'bullishEngulfing': return <BullishEngulfing width={110} height={110} />
                            case 'bearishEngulfing': return <BearishEngulfing width={110} height={110} />
                            case 'shootingStar': return <ShootingStar width={40} height={120} />
                            default: return <div className="w-9 h-28 bg-slate-300 rounded"></div>
                          }
                        }
                        
                        return (
                          <div className="px-4">
                            {/* Sequence Slots */}
                            <div className="flex justify-around mb-4">
                              {slots.map((_, slotIndex) => (
                                <div key={slotIndex} className="w-[70px] h-[110px] rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center">
                                  {sequenceSlots[slotIndex] && (() => {
                                    const option = options.find((o: any) => o.id === sequenceSlots[slotIndex])
                                    return option ? (
                                      <div className="flex flex-col items-center">
                                        {getCandleComponent(option.candleKey)}
                                        <button 
                                          onClick={() => removeFromSlot(slotIndex)}
                                          className="mt-1 text-xs text-red-500 hover:text-red-700"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ) : null
                                  })()}
                                </div>
                              ))}
                            </div>
                            
                            {/* Available Options */}
                            <div className="flex justify-around items-center mb-6">
                              {options.map((option: any) => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    // Find first empty slot
                                    const emptySlotIndex = sequenceSlots.findIndex(slot => !slot)
                                    if (emptySlotIndex !== -1) {
                                      placeInSlot(option.id, emptySlotIndex)
                                    }
                                  }}
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                  disabled={sequenceSlots.includes(option.id)}
                                >
                                  {getCandleComponent(option.candleKey)}
                                  <span className="mt-1 text-xs text-slate-600">{option.id}</span>
                                </button>
                              ))}
                            </div>
                            
                            {/* Submit Button */}
                            <div className="flex justify-center">
                              <button className="inline-flex items-center justify-center rounded-2xl bg-[#3F9FFF] px-7 py-3 text-lg font-extrabold text-white shadow-sm">
                                {step.activityConfig.sequenceBuild.submitText || 'אישור'}
                              </button>
                            </div>
                          </div>
                        )
                      })()}
                      {step.activity === 'dialog' && step.activityConfig?.dialog && (
                        <MockDialog
                          messages={step.activityConfig.dialog.messages || []}
                          typingSpeed={step.activityConfig.dialog.typingSpeed || 50}
                          autoAdvance={step.activityConfig.dialog.autoAdvance !== false}
                          autoAdvanceDelay={step.activityConfig.dialog.autoAdvanceDelay || 2000}
                          onComplete={() => {}}
                        />
                      )}
                      {step.activity === 'dragMatch' && step.activityConfig?.dragMatch && (
                        <MockDragMatchDrill
                          slots={step.activityConfig.dragMatch.slots || []}
                          tokens={step.activityConfig.dragMatch.tokens || []}
                          submitText={step.activityConfig.dragMatch.submitText || 'אישור'}
                          onSubmit={() => {}}
                        />
                      )}
                      {step.activity === 'questionWithImage' && step.activityConfig?.questionWithImage && (
                        <MockQuestionWithImage
                          question={step.activityConfig.questionWithImage.question || ''}
                          imageSource={step.activityConfig.questionWithImage.imageSource || 'chart_example'}
                          choices={step.activityConfig.questionWithImage.choices || []}
                          submitText={step.activityConfig.questionWithImage.submitText || 'בדוק'}
                          onSubmit={() => {}}
                        />
                      )}
                      </div>
                      </View>
                      <View style={{ paddingBottom: 20, paddingHorizontal: 12, alignItems: 'center' }}>
                        <MockProgressBar progress={0.35} width={300} height={17} />
                      </View>
                      <MockBottomNavbar activeTab="map" />
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


