import StepEditor from './StepEditor'
import { Accordion, AccordionItem } from './ui/accordion'

export default function LessonBuilder({ steps, onUpdate }: { steps: any[], onUpdate: (i:number,d:any)=>void }) {
  return (
    <div className="flex-1 h-full overflow-y-auto pr-2">
      <h3 className="text-lg font-semibold mb-2">Lesson Steps</h3>
      <Accordion>
        {steps.map((s, i) => {
          const header = `${s.activity || 'text'} • ${String(s.message || '').slice(0, 40)}`
          return (
            <AccordionItem key={i} title={header} defaultOpen={i === steps.length - 1}>
              <StepEditor step={s} onChange={(d:any) => onUpdate(i, d)} />
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}


