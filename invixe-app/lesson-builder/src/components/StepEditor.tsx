import { useEffect, useMemo, useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { candleKeys } from '../data/assetPools'
import { BullishCandleSVG, BearishCandleSVG, DojiCandleSVG, HammerCandleSVG } from '@app/components/lesson/CandlestickSVGs'

export default function StepEditor({ step, onChange }: { step:any, onChange:(d:any)=>void }) {
  const [local, setLocal] = useState(step)

  useEffect(() => { setLocal(step) }, [step])

  const handleField = (field:string, value:any) => {
    const updated = { ...local, [field]: value }
    setLocal(updated)
    onChange(updated)
  }

  const handleChoiceChange = (idx:number, field:string, value:any) => {
    const updated = { ...local, choices: [...(local.choices || [])] }
    updated.choices[idx] = { ...updated.choices[idx], [field]: value }
    setLocal(updated)
    onChange(updated)
  }

  const addChoice = () => {
    const updated = { ...local, choices: [...(local.choices || []), { text: '', nextStep: '' }] }
    setLocal(updated)
    onChange(updated)
  }

  const removeChoice = (idx:number) => {
    const updated = { ...local, choices: (local.choices || []).filter((_:any,i:number)=>i!==idx) }
    setLocal(updated)
    onChange(updated)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block">Step ID</Label>
          <Input value={local.id} onChange={e=>handleField('id', e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">Background</Label>
          <Select value={local.backgroundImage} onChange={e=>handleField('backgroundImage', e.target.value)}>
          {/* 'bg1','bg2','bg3','bg4','bg5','bg6','bg7','bg8','bg9','bg10','bg11', */}
            {['defaultBackground'].map(b=> (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3">
        <Label className="mb-1 block">Message</Label>
        <Textarea value={local.message} onChange={e=>handleField('message', e.target.value)} />
      </div>

      <Separator className="my-4" />

      {local.activity === 'multiSelect' && (
        <MultiSelectEditor local={local} onChange={onChange} setLocal={setLocal} />
      )}
      {local.activity === 'carouselSelect' && (
        <CarouselEditor local={local} onChange={onChange} setLocal={setLocal} />
      )}
      {local.activity === 'sequenceBuild' && (
        <SequenceBuildEditor local={local} onChange={onChange} setLocal={setLocal} />
      )}
      {local.activity === 'dialog' && (
        <DialogEditor local={local} onChange={onChange} setLocal={setLocal} />
      )}
      {local.activity === 'dragMatch' && (
        <DragMatchEditor local={local} onChange={onChange} setLocal={setLocal} />
      )}
      {local.activity === 'questionWithImage' && (
        <QuestionWithImageEditor local={local} onChange={onChange} setLocal={setLocal} />
      )}

      <Separator className="my-4" />

      <div>
        <div className="font-semibold mb-2">Choices</div>
        <div className="space-y-2">
          {(local.choices || []).map((c:any, idx:number) => (
            <div key={idx} className="grid grid-cols-2 gap-2 items-center">
              <Input placeholder="Text" value={c.text} onChange={e=>handleChoiceChange(idx,'text', e.target.value)} />
              <Input placeholder="Next Step" value={c.nextStep} onChange={e=>handleChoiceChange(idx,'nextStep', e.target.value)} />
              <Button variant="destructive" onClick={()=>removeChoice(idx)}>Remove</Button>
            </div>
          ))}
          <Button variant="secondary" onClick={addChoice}>Add Choice</Button>
        </div>
      </div>
    </div>
  )
}

function MultiSelectEditor({ local, onChange, setLocal }: any) {
  const ensure = () => ({ ...local, activityConfig: { submitText: 'Check Answer', layout: 'grid', options: [], ...(local.activityConfig||{}) } })
  const update = (u:any) => { setLocal(u); onChange(u) }
  const addOption = () => {
    const u = ensure()
    const id = `opt_${(u.activityConfig.options?.length||0)+1}`
    const options = [...(u.activityConfig.options||[]), { id, label: '', correct: false }]
    update({ ...u, activityConfig: { ...u.activityConfig, options } })
  }
  const setField = (field:string, value:any) => {
    const u = ensure(); update({ ...u, activityConfig: { ...u.activityConfig, [field]: value } })
  }
  const setOption = (idx:number, field:string, value:any) => {
    const u = ensure();
    const options = [...u.activityConfig.options];
    options[idx] = { ...options[idx], [field]: value };
    update({ ...u, activityConfig: { ...u.activityConfig, options } })
  }
  const removeOption = (idx:number) => {
    const u = ensure();
    const options = u.activityConfig.options.filter((_:any,i:number)=>i!==idx)
    update({ ...u, activityConfig: { ...u.activityConfig, options } })
  }
  return (
    <div>
      <div className="font-semibold mb-2">Multi Select</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="mb-1 block">Submit Text</Label>
          <Input value={local.activityConfig?.submitText||''} onChange={e=>setField('submitText', e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">Layout</Label>
          <Select value={local.activityConfig?.layout||'grid'} onChange={e=>setField('layout', e.target.value)}>
            <option value="grid">grid</option>
            <option value="list">list</option>
          </Select>
        </div>
      </div>
      <div className="mt-2 space-y-2">
        {(local.activityConfig?.options||[]).map((o:any, idx:number) => (
          <div key={idx} className="grid grid-cols-4 gap-2 items-center">
            <Input placeholder="Label" value={o.label||''} onChange={e=>setOption(idx,'label', e.target.value)} />
            <div className="relative group">
              <Select value={o.imageKey||''} onChange={e=>setOption(idx,'imageKey', e.target.value)}>
                <option value="">No image</option>
                {candleKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </Select>
              <div className="hidden group-hover:flex absolute left-full top-0 ml-2 z-10 rounded-md border border-slate-300 bg-white p-2 text-xs shadow-md items-center justify-center" style={{ width: 120, height: 120 }}>
                {!o.imageKey && <span className="text-slate-500">No image</span>}
                {o.imageKey === 'bullish' && <BullishCandleSVG width={40} height={120} />}
                {o.imageKey === 'bearish' && <BearishCandleSVG width={40} height={120} />}
                {o.imageKey === 'doji' && <DojiCandleSVG width={60} height={100} />}
                {o.imageKey === 'hammer' && <HammerCandleSVG width={60} height={120} />}
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!o.correct} onChange={e=>setOption(idx,'correct', e.target.checked)} /> Correct</label>
            <Button variant="destructive" onClick={()=>removeOption(idx)}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addOption}>Add Option</Button>
      </div>
    </div>
  )
}

function CarouselEditor({ local, onChange, setLocal }: any) {
  const ensure = () => ({ ...local, activityConfig: { ...(local.activityConfig||{}), carousel: { items: [], correctId: '', submitText: 'Confirm', ...(local.activityConfig?.carousel||{}) } } })
  const update = (u:any) => { setLocal(u); onChange(u) }
  const addItem = () => {
    const u = ensure()
    const id = `item_${(u.activityConfig.carousel.items?.length||0)+1}`
    const items = [...(u.activityConfig.carousel.items||[]), { id, label: '' }]
    update({ ...u, activityConfig: { ...u.activityConfig, carousel: { ...u.activityConfig.carousel, items } } })
  }
  const setField = (field:string, value:any) => {
    const u = ensure();
    update({ ...u, activityConfig: { ...u.activityConfig, carousel: { ...u.activityConfig.carousel, [field]: value } } })
  }
  const setItem = (idx:number, field:string, value:any) => {
    const u = ensure();
    const items = [...u.activityConfig.carousel.items];
    items[idx] = { ...items[idx], [field]: value }
    update({ ...u, activityConfig: { ...u.activityConfig, carousel: { ...u.activityConfig.carousel, items } } })
  }
  const removeItem = (idx:number) => {
    const u = ensure();
    const items = u.activityConfig.carousel.items.filter((_:any,i:number)=>i!==idx)
    update({ ...u, activityConfig: { ...u.activityConfig, carousel: { ...u.activityConfig.carousel, items } } })
  }

  const itemIdOptions = useMemo(() => (local.activityConfig?.carousel?.items||[]).map((i:any) => ({ id: i.id, label: i.label || i.id })), [local.activityConfig?.carousel?.items])

  return (
    <div>
      <div className="font-semibold mb-2">Carousel Select</div>
      <div className="grid grid-cols-3 gap-2 items-end">
        <div>
          <Label className="mb-1 block">Submit Text</Label>
          <Input value={local.activityConfig?.carousel?.submitText||''} onChange={e=>setField('submitText', e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">Correct Item</Label>
          <Select value={local.activityConfig?.carousel?.correctId||''} onChange={e=>setField('correctId', e.target.value)}>
            <option value="">Select item…</option>
            {itemIdOptions.map((o:any)=> <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
        </div>
        <div />
      </div>
      <div className="mt-2 space-y-2">
        {(local.activityConfig?.carousel?.items||[]).map((o:any, idx:number) => (
          <div key={idx} className="grid grid-cols-4 gap-2 items-center">
            <Input placeholder="ID" value={o.id||''} onChange={e=>setItem(idx,'id', e.target.value)} />
            <Input placeholder="Label" value={o.label||''} onChange={e=>setItem(idx,'label', e.target.value)} />
            <Select value={o.imageKey||''} onChange={e=>setItem(idx,'imageKey', e.target.value)}>
              <option value="">No image</option>
              {candleKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </Select>
            <Button variant="destructive" onClick={()=>removeItem(idx)}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addItem}>Add Item</Button>
      </div>
    </div>
  )
}

function SequenceBuildEditor({ local, onChange, setLocal }: any) {
  const ensure = () => ({ ...local, activityConfig: { ...(local.activityConfig||{}), sequenceBuild: { slotsCount: 2, options: [], correctSequence: [], submitText: 'Confirm', ...(local.activityConfig?.sequenceBuild||{}) } } })
  const update = (u:any) => { setLocal(u); onChange(u) }
  const addOption = () => {
    const u = ensure()
    const id = `opt_${(u.activityConfig.sequenceBuild.options?.length||0)+1}`
    const options = [...(u.activityConfig.sequenceBuild.options||[]), { id, candleKey: 'bullish' }]
    update({ ...u, activityConfig: { ...u.activityConfig, sequenceBuild: { ...u.activityConfig.sequenceBuild, options } } })
  }
  const setField = (field:string, value:any) => {
    const u = ensure();
    update({ ...u, activityConfig: { ...u.activityConfig, sequenceBuild: { ...u.activityConfig.sequenceBuild, [field]: value } } })
  }
  const setOption = (idx:number, field:string, value:any) => {
    const u = ensure();
    const options = [...u.activityConfig.sequenceBuild.options];
    options[idx] = { ...options[idx], [field]: value }
    update({ ...u, activityConfig: { ...u.activityConfig, sequenceBuild: { ...u.activityConfig.sequenceBuild, options } } })
  }
  const removeOption = (idx:number) => {
    const u = ensure();
    const options = u.activityConfig.sequenceBuild.options.filter((_:any,i:number)=>i!==idx)
    update({ ...u, activityConfig: { ...u.activityConfig, sequenceBuild: { ...u.activityConfig.sequenceBuild, options } } })
  }

  const optionIdChoices = useMemo(() => (local.activityConfig?.sequenceBuild?.options||[]).map((o:any)=>({ id: o.id, label: o.id })), [local.activityConfig?.sequenceBuild?.options])

  return (
    <div>
      <div className="font-semibold mb-2">Sequence Build</div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="mb-1 block">Slots Count</Label>
          <Input type="number" min={1} value={local.activityConfig?.sequenceBuild?.slotsCount||1} onChange={e=>setField('slotsCount', Number(e.target.value))} />
        </div>
        <div>
          <Label className="mb-1 block">Submit Text</Label>
          <Input value={local.activityConfig?.sequenceBuild?.submitText||''} onChange={e=>setField('submitText', e.target.value)} />
        </div>
      </div>
      <div className="mt-2 space-y-2">
        {(local.activityConfig?.sequenceBuild?.options||[]).map((o:any, idx:number) => (
          <div key={idx} className="grid grid-cols-4 gap-2 items-center">
            <Input placeholder="ID" value={o.id||''} onChange={e=>setOption(idx,'id', e.target.value)} />
            <Select value={o.candleKey||'bullish'} onChange={e=>setOption(idx,'candleKey', e.target.value)}>
              {candleKeys.map(k=>(<option key={k} value={k}>{k}</option>))}
            </Select>
            <div className="text-xs text-slate-500">Use IDs below in correct sequence</div>
            <Button variant="destructive" onClick={()=>removeOption(idx)}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addOption}>Add Option</Button>
      </div>
      <div className="mt-4">
        <Label className="mb-1 block">Correct Sequence</Label>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: local.activityConfig?.sequenceBuild?.slotsCount || 0 }).map((_, i:number) => (
            <Select key={i} value={local.activityConfig?.sequenceBuild?.correctSequence?.[i] || ''} onChange={e=>{
              const arr = [...(local.activityConfig?.sequenceBuild?.correctSequence || [])]
              arr[i] = e.target.value
              setField('correctSequence', arr)
            }}>
              <option value="">Select option…</option>
              {optionIdChoices.map((o: { id: string; label: string }) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </Select>
          ))}
        </div>
      </div>
    </div>
  )
}

function DialogEditor({ local, onChange, setLocal }: any) {
  const ensure = () => ({ 
    ...local, 
    activityConfig: { 
      dialog: {
        messages: [],
        typingSpeed: 50,
        autoAdvance: true,
        autoAdvanceDelay: 2000,
        ...(local.activityConfig?.dialog || {})
      },
      ...(local.activityConfig || {})
    } 
  })
  
  const update = (u: any) => { setLocal(u); onChange(u) }
  
  const addMessage = () => {
    const u = ensure()
    const messages = [...(u.activityConfig.dialog.messages || []), { 
      id: `msg_${(u.activityConfig.dialog.messages?.length || 0) + 1}`, 
      characterId: '', 
      text: '',
      delay: 0
    }]
    update({ ...u, activityConfig: { ...u.activityConfig, dialog: { ...u.activityConfig.dialog, messages } } })
  }
  
  const setField = (field: string, value: any) => {
    const u = ensure()
    update({ ...u, activityConfig: { ...u.activityConfig, dialog: { ...u.activityConfig.dialog, [field]: value } } })
  }
  
  const setMessage = (idx: number, field: string, value: any) => {
    const u = ensure()
    const messages = [...u.activityConfig.dialog.messages]
    messages[idx] = { ...messages[idx], [field]: value }
    update({ ...u, activityConfig: { ...u.activityConfig, dialog: { ...u.activityConfig.dialog, messages } } })
  }
  
  const removeMessage = (idx: number) => {
    const u = ensure()
    const messages = u.activityConfig.dialog.messages.filter((_: any, i: number) => i !== idx)
    update({ ...u, activityConfig: { ...u.activityConfig, dialog: { ...u.activityConfig.dialog, messages } } })
  }
  
  return (
    <div>
      <div className="font-semibold mb-3">Dialog Configuration</div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="mb-1 block">Typing Speed (ms)</Label>
          <Input 
            type="number" 
            value={local.activityConfig?.dialog?.typingSpeed || 50} 
            onChange={e => setField('typingSpeed', parseInt(e.target.value) || 50)} 
          />
        </div>
        <div>
          <Label className="mb-1 block">Auto Advance Delay (ms)</Label>
          <Input 
            type="number" 
            value={local.activityConfig?.dialog?.autoAdvanceDelay || 2000} 
            onChange={e => setField('autoAdvanceDelay', parseInt(e.target.value) || 2000)} 
          />
        </div>
      </div>
      
      <div className="mb-3">
        <Label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={local.activityConfig?.dialog?.autoAdvance !== false} 
            onChange={e => setField('autoAdvance', e.target.checked)} 
          />
          Auto Advance Messages
        </Label>
      </div>
      
      <div className="space-y-3">
        <div className="font-medium">Messages</div>
        {(local.activityConfig?.dialog?.messages || []).map((msg: any, idx: number) => (
          <div key={idx} className="border rounded p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="mb-1 block">Message ID</Label>
                <Input 
                  value={msg.id || ''} 
                  onChange={e => setMessage(idx, 'id', e.target.value)} 
                />
              </div>
              <div>
                <Label className="mb-1 block">Character</Label>
                <Select 
                  value={msg.characterId || ''} 
                  onChange={e => setMessage(idx, 'characterId', e.target.value)}
                >
                  <option value="">Narrator</option>
                  <option value="character1">Teacher (Blue)</option>
                  <option value="character2">Student (Green)</option>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Delay (ms)</Label>
                <Input 
                  type="number" 
                  value={msg.delay || 0} 
                  onChange={e => setMessage(idx, 'delay', parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Message Text</Label>
              <Textarea 
                value={msg.text || ''} 
                onChange={e => setMessage(idx, 'text', e.target.value)} 
                placeholder="Enter message text..."
                rows={2}
              />
            </div>
            <Button variant="destructive" onClick={() => removeMessage(idx)}>
              Remove Message
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={addMessage}>
          Add Message
        </Button>
      </div>
    </div>
  )
}

function DragMatchEditor({ local, onChange, setLocal }: any) {
  const ensure = () => ({ 
    ...local, 
    activityConfig: { 
      dragMatch: {
        slots: [],
        tokens: [],
        submitText: 'אישור',
        ...(local.activityConfig?.dragMatch || {})
      },
      ...(local.activityConfig || {})
    } 
  })
  
  const update = (u: any) => { setLocal(u); onChange(u) }
  
  const addSlot = () => {
    const u = ensure()
    const slots = [...(u.activityConfig.dragMatch.slots || []), { 
      id: `slot_${(u.activityConfig.dragMatch.slots?.length || 0) + 1}`, 
      drawKey: 'hammer'
    }]
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, slots } } })
  }
  
  const addToken = () => {
    const u = ensure()
    const tokens = [...(u.activityConfig.dragMatch.tokens || []), { 
      id: `token_${(u.activityConfig.dragMatch.tokens?.length || 0) + 1}`, 
      label: '',
      targetSlotId: ''
    }]
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, tokens } } })
  }
  
  const setField = (field: string, value: any) => {
    const u = ensure()
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, [field]: value } } })
  }
  
  const setSlot = (idx: number, field: string, value: any) => {
    const u = ensure()
    const slots = [...u.activityConfig.dragMatch.slots]
    slots[idx] = { ...slots[idx], [field]: value }
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, slots } } })
  }
  
  const setToken = (idx: number, field: string, value: any) => {
    const u = ensure()
    const tokens = [...u.activityConfig.dragMatch.tokens]
    tokens[idx] = { ...tokens[idx], [field]: value }
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, tokens } } })
  }
  
  const removeSlot = (idx: number) => {
    const u = ensure()
    const slots = u.activityConfig.dragMatch.slots.filter((_: any, i: number) => i !== idx)
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, slots } } })
  }
  
  const removeToken = (idx: number) => {
    const u = ensure()
    const tokens = u.activityConfig.dragMatch.tokens.filter((_: any, i: number) => i !== idx)
    update({ ...u, activityConfig: { ...u.activityConfig, dragMatch: { ...u.activityConfig.dragMatch, tokens } } })
  }
  
  const slotOptions = (local.activityConfig?.dragMatch?.slots || []).map((s: any) => ({ value: s.id, label: s.id }))
  
  return (
    <div>
      <div className="font-semibold mb-3">Drag Match Configuration</div>
      
      <div className="mb-4">
        <Label className="mb-1 block">Submit Text</Label>
        <Input 
          value={local.activityConfig?.dragMatch?.submitText || 'אישור'} 
          onChange={e => setField('submitText', e.target.value)} 
        />
      </div>
      
      <div className="space-y-4">
        {/* Slots */}
        <div>
          <div className="font-medium mb-2">Slots (Candlestick Patterns)</div>
          <div className="space-y-2">
            {(local.activityConfig?.dragMatch?.slots || []).map((slot: any, idx: number) => (
              <div key={idx} className="border rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-1 block">Slot ID</Label>
                    <Input 
                      value={slot.id || ''} 
                      onChange={e => setSlot(idx, 'id', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Candlestick Type</Label>
                    <Select 
                      value={slot.drawKey || ''} 
                      onChange={e => setSlot(idx, 'drawKey', e.target.value)}
                    >
                      <option value="hammer">Hammer</option>
                      <option value="invertedHammerNew">Inverted Hammer</option>
                      <option value="doji">Doji</option>
                      <option value="dragonflyDoji">Dragonfly Doji</option>
                      <option value="regularDoji">Regular Doji</option>
                      <option value="shootingStar">Shooting Star</option>
                    </Select>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => removeSlot(idx)}>
                  Remove Slot
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addSlot}>
              Add Slot
            </Button>
          </div>
        </div>
        
        {/* Tokens */}
        <div>
          <div className="font-medium mb-2">Tokens (Draggable Labels)</div>
          <div className="space-y-2">
            {(local.activityConfig?.dragMatch?.tokens || []).map((token: any, idx: number) => (
              <div key={idx} className="border rounded p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="mb-1 block">Token ID</Label>
                    <Input 
                      value={token.id || ''} 
                      onChange={e => setToken(idx, 'id', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Label Text</Label>
                    <Input 
                      value={token.label || ''} 
                      onChange={e => setToken(idx, 'label', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Target Slot</Label>
                    <Select 
                      value={token.targetSlotId || ''} 
                      onChange={e => setToken(idx, 'targetSlotId', e.target.value)}
                    >
                      <option value="">Select slot...</option>
                      {slotOptions.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => removeToken(idx)}>
                  Remove Token
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addToken}>
              Add Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuestionWithImageEditor({ local, onChange, setLocal }: any) {
  const ensure = () => ({ 
    ...local, 
    activityConfig: { 
      questionWithImage: {
        question: '',
        imageSource: 'chart_example',
        choices: [],
        submitText: 'בדוק',
        ...(local.activityConfig?.questionWithImage || {})
      },
      ...(local.activityConfig || {})
    } 
  })
  
  const update = (u: any) => { setLocal(u); onChange(u) }
  
  const addChoice = () => {
    const u = ensure()
    const choices = [...(u.activityConfig.questionWithImage.choices || []), { 
      id: `choice_${(u.activityConfig.questionWithImage.choices?.length || 0) + 1}`, 
      text: '',
      correct: false
    }]
    update({ ...u, activityConfig: { ...u.activityConfig, questionWithImage: { ...u.activityConfig.questionWithImage, choices } } })
  }
  
  const setField = (field: string, value: any) => {
    const u = ensure()
    update({ ...u, activityConfig: { ...u.activityConfig, questionWithImage: { ...u.activityConfig.questionWithImage, [field]: value } } })
  }
  
  const setChoice = (idx: number, field: string, value: any) => {
    const u = ensure()
    const choices = [...u.activityConfig.questionWithImage.choices]
    choices[idx] = { ...choices[idx], [field]: value }
    update({ ...u, activityConfig: { ...u.activityConfig, questionWithImage: { ...u.activityConfig.questionWithImage, choices } } })
  }
  
  const removeChoice = (idx: number) => {
    const u = ensure()
    const choices = u.activityConfig.questionWithImage.choices.filter((_: any, i: number) => i !== idx)
    update({ ...u, activityConfig: { ...u.activityConfig, questionWithImage: { ...u.activityConfig.questionWithImage, choices } } })
  }
  
  return (
    <div>
      <div className="font-semibold mb-3">Question with Image Configuration</div>
      
      <div className="space-y-4">
        <div>
          <Label className="mb-1 block">Question Text</Label>
          <Textarea 
            value={local.activityConfig?.questionWithImage?.question || ''} 
            onChange={e => setField('question', e.target.value)} 
            placeholder="Enter your question..."
            rows={3}
          />
        </div>
        
        <div>
          <Label className="mb-1 block">Image Source</Label>
          <Select 
            value={local.activityConfig?.questionWithImage?.imageSource || 'chart_example'} 
            onChange={e => setField('imageSource', e.target.value)}
          >
            <option value="chart_example">Chart Example (AAPL)</option>
            <option value="candlestick_chart">Candlestick Chart</option>
            <option value="trading_screen">Trading Screen</option>
            <option value="market_data">Market Data</option>
          </Select>
        </div>
        
        <div>
          <Label className="mb-1 block">Submit Text</Label>
          <Input 
            value={local.activityConfig?.questionWithImage?.submitText || 'בדוק'} 
            onChange={e => setField('submitText', e.target.value)} 
          />
        </div>
        
        <div>
          <div className="font-medium mb-2">Answer Choices</div>
          <div className="space-y-2">
            {(local.activityConfig?.questionWithImage?.choices || []).map((choice: any, idx: number) => (
              <div key={idx} className="border rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="mb-1 block">Choice ID</Label>
                    <Input 
                      value={choice.id || ''} 
                      onChange={e => setChoice(idx, 'id', e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={choice.correct || false} 
                        onChange={e => setChoice(idx, 'correct', e.target.checked)} 
                      />
                      Correct Answer
                    </Label>
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Choice Text</Label>
                  <Textarea 
                    value={choice.text || ''} 
                    onChange={e => setChoice(idx, 'text', e.target.value)} 
                    placeholder="Enter choice text..."
                    rows={2}
                  />
                </div>
                <Button variant="destructive" onClick={() => removeChoice(idx)}>
                  Remove Choice
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addChoice}>
              Add Choice
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


