import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeLessonFile(rootDir: string, step: number, lessonId: number, stepsJson: any[]) {
  const lessonsDir = path.resolve(rootDir, '../src/modules/lessons')
  const stepDir = path.resolve(lessonsDir, `step${step}`)
  ensureDirSync(stepDir)
  const filePath = path.resolve(stepDir, `lesson${lessonId}.ts`)
  const content = `import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = ${JSON.stringify(stepsJson, null, 2)};
`
  fs.writeFileSync(filePath, content, 'utf8')
  return filePath
}

function updateRegistry(rootDir: string, step: number, lessonId: number, title: string) {
  const registryPath = path.resolve(rootDir, '../src/modules/lessons/registry.ts')
  let src = fs.readFileSync(registryPath, 'utf8')

  const stepMarker = `step: ${step},`
  const stepIdx = src.indexOf(stepMarker)
  if (stepIdx === -1) throw new Error(`Step ${step} not found in registry.ts`)
  const lessonsIdx = src.indexOf('lessons:', stepIdx)
  if (lessonsIdx === -1) throw new Error(`lessons array not found for step ${step}`)
  const openBracketIdx = src.indexOf('[', lessonsIdx)
  if (openBracketIdx === -1) throw new Error('lessons array [ not found')
  let i = openBracketIdx
  let depth = 0
  let endIdx = -1
  while (i < src.length) {
    const ch = src[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) { endIdx = i; break }
    }
    i++
  }
  if (endIdx === -1) throw new Error('Failed to find end of lessons array')

  const block = `{
      id: ${lessonId},
      title: "${title.replace(/"/g, '\\"')}",
      description: "",
      lessonType: "info",
      unlockRequirements: {},
    },`

  src = src.slice(0, endIdx) + (src[openBracketIdx+1] === ']' ? '\n' : '\n') + '      ' + block + '\n' + src.slice(endIdx)
  fs.writeFileSync(registryPath, src, 'utf8')
}

function updateLessonScreenMap(rootDir: string, step: number, lessonId: number) {
  const screenPath = path.resolve(rootDir, '../src/screens/LessonScreen.tsx')
  if (!fs.existsSync(screenPath)) return
  let src = fs.readFileSync(screenPath, 'utf8')

  const importLine = `import { lessonSteps as lesson${lessonId}Steps } from "../modules/lessons/step${step}/lesson${lessonId}";`
  if (!src.includes(importLine)) {
    const importAnchor = /import\s+\{\s*lessonSteps\s+as\s+lesson\d+Steps\s*\}\s+from\s+"\.\.\/modules\/lessons\/step\d+\/lesson\d+";?/g
    let lastMatch: RegExpExecArray | null = null
    let m: RegExpExecArray | null
    while ((m = importAnchor.exec(src)) !== null) lastMatch = m
    if (lastMatch) {
      const idx = lastMatch.index + lastMatch[0].length
      src = src.slice(0, idx) + "\n" + importLine + src.slice(idx)
    } else {
      const typeImport = 'import { LessonStep } from "../modules/lessons/types";'
      const idx = src.indexOf(typeImport)
      if (idx !== -1) {
        const nl = src.indexOf('\n', idx) + 1
        src = src.slice(0, nl) + importLine + "\n" + src.slice(nl)
      } else {
        src = importLine + "\n" + src
      }
    }
  }

  const mapStart = src.indexOf('const lessonSteps: Record<number, LessonStep[]> = {')
  if (mapStart !== -1) {
    const mapOpen = src.indexOf('{', mapStart)
    let i = mapOpen
    let depth = 0
    let closeIdx = -1
    while (i < src.length) {
      const ch = src[i]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) { closeIdx = i; break }
      }
      i++
    }
    if (closeIdx !== -1 && !src.includes(`${lessonId}: lesson${lessonId}Steps`)) {
      const insertion = `\n  ${lessonId}: lesson${lessonId}Steps,`
      src = src.slice(0, closeIdx) + insertion + "\n" + src.slice(closeIdx)
    }
  }
  fs.writeFileSync(screenPath, src, 'utf8')
}

// https://vite.dev/config/
const baseConfig = defineConfig({
  plugins: [react() as any],
  server: {
    middlewareMode: false,
    fs: {
      allow: [
        // Allow importing assets/components from the app src for real preview
        // The current working dir is lesson-builder
        // So allow navigating up to ../src
        '../',
      ],
    },
  },
  resolve: {
    alias: (() => {
      let rnWeb = ''
      try {
        rnWeb = require.resolve('react-native-web')
      } catch {}
      const aliasArray = [] as any[]
      aliasArray.push({ find: 'react-native/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, 'src/shims/codegenNativeComponent.ts') })
      aliasArray.push({ find: 'react-native', replacement: rnWeb || 'react-native-web' })
      // Shim react-native-svg to DOM SVG for web preview
      aliasArray.push({ find: 'react-native-svg', replacement: path.resolve(__dirname, 'src/shims/react-native-svg.tsx') })
      return aliasArray
    })(),
  },
})

// Inject a dev-only plugin to provide local endpoints
;(baseConfig as any).plugins.push(
  {
    name: 'builder-dev-api',
    apply: 'serve',
    configureServer(server: any) {
      // Export lesson
      server.middlewares.use('/api/exportLesson', async (req: any, res: any) => {
        try {
          if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
          if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
          const chunks: any[] = []
          req.on('data', (c: any) => chunks.push(c))
          req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8')
            const body = JSON.parse(raw)
            const { step, lessonId, title, steps } = body
            if (!step || !lessonId || !Array.isArray(steps)) { res.statusCode = 400; res.end('Invalid body'); return }
            const rootDir = process.cwd()
            writeLessonFile(rootDir, Number(step), Number(lessonId), steps)
            updateRegistry(rootDir, Number(step), Number(lessonId), title || 'New Lesson')
            updateLessonScreenMap(rootDir, Number(step), Number(lessonId))
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          })
        } catch (e: any) {
          res.statusCode = 500
          res.end(String(e?.message || e))
        }
      })

      // List existing lessons by scanning files
      server.middlewares.use('/api/lessons', (_req: any, res: any) => {
        try {
          const rootDir = process.cwd()
          const base = path.resolve(rootDir, '../src/modules/lessons')
          const steps = fs.readdirSync(base).filter(d => d.startsWith('step'))
          const results: any[] = []
          for (const stepDir of steps) {
            const full = path.join(base, stepDir)
            const files = fs.readdirSync(full).filter(f => f.startsWith('lesson') && f.endsWith('.ts'))
            for (const f of files) {
              const match = f.match(/lesson(\d+)\.ts$/)
              const id = match ? Number(match[1]) : undefined
              if (id) results.push({ step: Number(stepDir.replace('step','')), id, file: path.join('src/modules/lessons', stepDir, f) })
            }
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ lessons: results }))
        } catch (e: any) {
          res.statusCode = 500; res.end(String(e?.message || e))
        }
      })

      // Read a lesson file and return JSON of lessonSteps array
      server.middlewares.use('/api/lesson', (req: any, res: any) => {
        try {
          const url = new URL(req.url!, 'http://localhost')
          const step = url.searchParams.get('step')
          const id = url.searchParams.get('id')
          if (!step || !id) { res.statusCode = 400; res.end('Missing step/id'); return }
          const rootDir = process.cwd()
          const file = path.resolve(rootDir, `../src/modules/lessons/step${step}/lesson${id}.ts`)
          if (!fs.existsSync(file)) { res.statusCode = 404; res.end('Not found'); return }
          const src = fs.readFileSync(file, 'utf8')
          const match = src.match(/export const lessonSteps: LessonStep\[] = ([\s\S]*?);\s*$/)
          if (!match) { res.statusCode = 500; res.end('Unable to parse'); return }
          const json = match[1]
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ steps: JSON.parse(json) }))
        } catch (e: any) {
          res.statusCode = 500; res.end(String(e?.message || e))
        }
      })
    }
  } as Plugin
)

export default baseConfig
