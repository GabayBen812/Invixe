import { templates } from '../data/templates'
import { Card, CardContent, CardHeader } from './ui/card'
import { Tooltip } from './ui/tooltip'
import { Button } from './ui/button'

export default function TemplateGallery({ onSelect }: { onSelect: (t: any) => void }) {
  return (
    <div className="w-72 shrink-0 h-full overflow-y-auto pr-2">
      <h3 className="text-lg font-semibold mb-2">Templates</h3>
      <div className="grid grid-cols-1 gap-3">
        {templates.map(t => (
          <Card key={t.id} className="transition hover:shadow-md">
            <CardHeader className="p-3">
              <Tooltip content={t.description || t.name}>
                <div className="text-sm font-medium truncate">{t.name}</div>
              </Tooltip>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="p-2">
                <img src={t.image} alt={t.name} className="w-full h-24 object-cover rounded-md border" />
              </div>
              <Button
                variant="secondary"
                className="w-full mt-2"
                aria-label={`Add ${t.name}`}
                onClick={() => onSelect(t)}
              >
                + Add
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


