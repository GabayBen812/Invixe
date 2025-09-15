import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react'

type Lang = 'en' | 'he'

const strings: Record<Lang, Record<string, string>> = {
  en: {
    templates: 'Templates',
    lessonSteps: 'Lesson Steps',
    exportJson: 'Export JSON',
    exportToApp: 'Export to App',
    saveDraft: 'Save Draft',
    previewJson: 'Preview JSON',
    startNewLesson: 'Start a new lesson',
    lessonTitle: 'Lesson Title',
    courseStep: 'Course Step',
    lessonId: 'Lesson ID',
    position: 'Position',
    startBuilding: 'Start Building',
    hide: 'Hide',
    show: 'Show',
    useTemplate: 'Use Template',
    stepId: 'Step ID',
    background: 'Background',
    message: 'Message',
    multiSelect: 'Multi Select',
    submitText: 'Submit Text',
    layout: 'Layout',
    label: 'Label',
    imageKey: 'Image Key (optional)',
    correct: 'Correct',
    addOption: 'Add Option',
    remove: 'Remove',
    addChoice: 'Add Choice',
    choices: 'Choices',
    carouselSelect: 'Carousel Select',
    correctItemId: 'Correct Item ID',
    addItem: 'Add Item',
    sequenceBuild: 'Sequence Build',
    slotsCount: 'Slots Count',
    correctSequenceCsv: 'Correct Sequence (comma-separated IDs)'
  },
  he: {
    templates: 'תבניות',
    lessonSteps: 'שלבי שיעור',
    exportJson: 'ייצוא JSON',
    exportToApp: 'ייצוא ליישום',
    saveDraft: 'שמירת טיוטה',
    previewJson: 'תצוגת JSON',
    startNewLesson: 'התחל שיעור חדש',
    lessonTitle: 'כותרת שיעור',
    courseStep: 'מסלול קורס',
    lessonId: 'מספר שיעור',
    position: 'מיקום בקורס',
    startBuilding: 'התחל לבנות',
    hide: 'הסתר',
    show: 'הצג',
    useTemplate: 'בחר תבנית',
    stepId: 'מזהה שלב',
    background: 'רקע',
    message: 'הודעה',
    multiSelect: 'בחירה מרובה',
    submitText: 'טקסט כפתור',
    layout: 'פריסה',
    label: 'תווית',
    imageKey: 'מפתח תמונה (רשות)',
    correct: 'נכון',
    addOption: 'הוסף אפשרות',
    remove: 'הסרה',
    addChoice: 'הוסף בחירה',
    choices: 'בחירות',
    carouselSelect: 'קרוסלה',
    correctItemId: 'מזהה פריט נכון',
    addItem: 'הוסף פריט',
    sequenceBuild: 'בניית רצף',
    slotsCount: 'מספר משבצות',
    correctSequenceCsv: 'רצף נכון (מופרד בפסיקים)'
  }
}

interface I18nContextValue {
  lang: Lang
  t: (key: string) => string
  setLang: (l: Lang) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    // Apply dir on html element
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr')
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key: string) => strings[lang][key] ?? key
  }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}


