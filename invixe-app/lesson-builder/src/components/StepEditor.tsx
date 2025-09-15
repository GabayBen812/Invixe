import { useEffect, useMemo, useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { characterImageKeys, candleKeys } from '../data/assetPools'

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
            {['bg1','bg2','bg3','bg4','bg5','bg6','bg7','bg8','bg9','bg10','bg11'].map(b=> (
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
            <Select value={o.imageKey||''} onChange={e=>setOption(idx,'imageKey', e.target.value)}>
              <option value="">No image</option>
              {characterImageKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </Select>
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
              {characterImageKeys.map(k => <option key={k} value={k}>{k}</option>)}
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
              {optionIdChoices.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </Select>
          ))}
        </div>
      </div>
    </div>
  )
}


