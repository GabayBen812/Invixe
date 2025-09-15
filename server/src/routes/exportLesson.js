const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeLessonFile(rootDir, step, lessonId, stepsJson) {
  const lessonsDir = path.resolve(rootDir, 'invixe-app', 'src', 'modules', 'lessons');
  const stepDir = path.resolve(lessonsDir, `step${step}`);
  ensureDirSync(stepDir);
  const filePath = path.resolve(stepDir, `lesson${lessonId}.ts`);
  const content = `import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = ${JSON.stringify(stepsJson, null, 2)};
`;
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function updateRegistry(rootDir, step, lessonId, title) {
  const registryPath = path.resolve(rootDir, 'invixe-app', 'src', 'modules', 'lessons', 'registry.ts');
  if (!fs.existsSync(registryPath)) return;
  let src = fs.readFileSync(registryPath, 'utf8');

  const stepMarker = `step: ${step},`;
  const stepIdx = src.indexOf(stepMarker);
  if (stepIdx === -1) return; // do nothing if step not found
  const lessonsIdx = src.indexOf('lessons:', stepIdx);
  if (lessonsIdx === -1) return;
  const openBracketIdx = src.indexOf('[', lessonsIdx);
  if (openBracketIdx === -1) return;

  // find closing bracket of the lessons array
  let i = openBracketIdx;
  let depth = 0;
  let endIdx = -1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
    i++;
  }
  if (endIdx === -1) return;

  const block = `{
      id: ${lessonId},
      title: "${String(title || 'New Lesson').replace(/"/g, '\\"')}",
      description: "",
      lessonType: "info",
      unlockRequirements: {},
    },`;

  // Don't duplicate entries
  if (src.includes(`id: ${lessonId},`)) return;

  src = src.slice(0, endIdx) + '\n      ' + block + '\n' + src.slice(endIdx);
  fs.writeFileSync(registryPath, src, 'utf8');
}

function updateLessonScreenMap(rootDir, step, lessonId) {
  const screenPath = path.resolve(rootDir, 'invixe-app', 'src', 'screens', 'LessonScreen.tsx');
  if (!fs.existsSync(screenPath)) return;
  let src = fs.readFileSync(screenPath, 'utf8');

  const importLine = `import { lessonSteps as lesson${lessonId}Steps } from "../modules/lessons/step${step}/lesson${lessonId}";`;
  if (!src.includes(importLine)) {
    const importAnchor = /import\s+\{\s*lessonSteps\s+as\s+lesson\d+Steps\s*\}\s+from\s+"\.\.\/modules\/lessons\/step\d+\/lesson\d+";?/g;
    let lastMatch = null; let m;
    while ((m = importAnchor.exec(src)) !== null) lastMatch = m;
    if (lastMatch) {
      const idx = lastMatch.index + lastMatch[0].length;
      src = src.slice(0, idx) + "\n" + importLine + src.slice(idx);
    } else {
      const typeImport = 'import { LessonStep } from "../modules/lessons/types";';
      const idx = src.indexOf(typeImport);
      if (idx !== -1) {
        const nl = src.indexOf('\n', idx) + 1;
        src = src.slice(0, nl) + importLine + "\n" + src.slice(nl);
      } else {
        src = importLine + "\n" + src;
      }
    }
  }

  const mapStart = src.indexOf('const lessonSteps: Record<number, LessonStep[]> = {');
  if (mapStart !== -1 && !src.includes(`${lessonId}: lesson${lessonId}Steps`)) {
    const mapOpen = src.indexOf('{', mapStart);
    let i = mapOpen, depth = 0, closeIdx = -1;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { closeIdx = i; break; } }
      i++;
    }
    if (closeIdx !== -1) {
      const insertion = `\n  ${lessonId}: lesson${lessonId}Steps,`;
      src = src.slice(0, closeIdx) + insertion + "\n" + src.slice(closeIdx);
    }
  }
  fs.writeFileSync(screenPath, src, 'utf8');
}

router.options('/', (_req, res) => res.status(204).end());

router.post('/', (req, res) => {
  try {
    const { step, lessonId, title, steps } = req.body || {};
    if (!step || !lessonId || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Invalid body' });
    }
    const rootDir = path.resolve(__dirname, '..', '..'); // /server
    const repoRoot = path.resolve(rootDir, '..'); // project root

    // Rebind helpers to write into sibling invixe-app (not server/invixe-app)
    const lessonsDir = path.resolve(repoRoot, 'invixe-app', 'src', 'modules', 'lessons');
    const registryPath = path.resolve(repoRoot, 'invixe-app', 'src', 'modules', 'lessons', 'registry.ts');
    const lessonScreenPath = path.resolve(repoRoot, 'invixe-app', 'src', 'screens', 'LessonScreen.tsx');

    // Write lesson file
    (function writeLesson() {
      const stepDir = path.resolve(lessonsDir, `step${Number(step)}`);
      if (!fs.existsSync(stepDir)) fs.mkdirSync(stepDir, { recursive: true });
      const filePath = path.resolve(stepDir, `lesson${Number(lessonId)}.ts`);
      const content = `import { LessonStep } from "../types";\n\nexport const lessonSteps: LessonStep[] = ${JSON.stringify(steps, null, 2)};\n`;
      fs.writeFileSync(filePath, content, 'utf8');
    })();

    // Update registry with consistent parent creation/insertion
    ;(function updateReg() {
      if (!fs.existsSync(registryPath)) return;
      let src = fs.readFileSync(registryPath, 'utf8');
      const numLessonId = Number(lessonId);
      const numStep = Number(step);
      if (src.includes(`id: ${numLessonId},`)) return;

      const group = Math.floor(numLessonId / 100); // 5 for 501
      const groupSeed = group * 100 + 1; // 501 -> 501, 4xx -> 401

      // Ensure step block exists; if not, create a fresh one
      const stepMarker = `step: ${numStep},`;
      let stepIdx = src.indexOf(stepMarker);
      if (stepIdx === -1) {
        const insertAfter = src.lastIndexOf('];');
        const newStepBlock = `  {\n    step: ${numStep},\n    lessons: [\n      {\n        id: ${group * 10},\n        title: "${`New Lesson ${group}`}",\n        description: "",\n        lessonType: "info",\n        unlockRequirements: {},\n        sublessons: [\n          { id: ${numLessonId}, title: "${String(title || 'New Sublesson').replace(/"/g, '\\"')}", description: "", lessonType: "info" },\n        ],\n      },\n    ],\n  },\n`;
        src = src.replace(/\n\];\n\s*$/, `\n${newStepBlock}]\n`);
        fs.writeFileSync(registryPath, src, 'utf8');
        return;
      }

      // We have a step block; limit operations within it
      const nextStepIdx = src.indexOf('\n  {\n    step:', stepIdx + stepMarker.length);
      const stepBlockEnd = nextStepIdx !== -1 ? nextStepIdx : src.length;
      const stepBlock = src.slice(stepIdx, stepBlockEnd);
      const localOffset = stepIdx;

      // Try to find an existing parent whose sublessons array contains this hundreds group
      let foundInserted = false;
      let searchPos = 0;
      while (true) {
        const subIdx = stepBlock.indexOf('sublessons:', searchPos);
        if (subIdx === -1) break;
        const arrOpen = stepBlock.indexOf('[', subIdx);
        if (arrOpen === -1) break;
        let i3 = arrOpen, depth3 = 0, arrClose = -1;
        while (i3 < stepBlock.length) {
          const ch = stepBlock[i3];
          if (ch === '[') depth3++;
          else if (ch === ']') { depth3--; if (depth3 === 0) { arrClose = i3; break; } }
          i3++;
        }
        if (arrClose === -1) break;
        const arrContent = stepBlock.slice(arrOpen, arrClose);
        if (arrContent.includes(`id: ${groupSeed}`)) {
          // Insert in order (by sublesson id)
          const globalArrOpen = localOffset + arrOpen;
          const globalArrClose = localOffset + arrClose;
          // Find first sublesson with id greater than new id
          const relContent = src.slice(globalArrOpen, globalArrClose);
          const idRegex = /id:\s*(\d+),/g;
          let match, insertPos = globalArrClose;
          while ((match = idRegex.exec(relContent)) !== null) {
            const val = Number(match[1]);
            if (val > numLessonId) {
              insertPos = globalArrOpen + match.index; // before this entry
              break;
            }
          }
          const subBlock = `\n          { id: ${numLessonId}, title: "${String(title || 'New Sublesson').replace(/"/g, '\\"')}", description: "", lessonType: "info" },`;
          src = src.slice(0, insertPos) + subBlock + src.slice(insertPos);
          fs.writeFileSync(registryPath, src, 'utf8');
          foundInserted = true;
          break;
        }
        searchPos = arrClose + 1;
      }
      if (foundInserted) return;

      // No parent found; create a new parent within this step's lessons array
      const lessonsIdx = stepBlock.indexOf('lessons:');
      if (lessonsIdx === -1) return;
      const listOpen = stepBlock.indexOf('[', lessonsIdx);
      if (listOpen === -1) return;
      let i5 = listOpen, depth5 = 0, listClose = -1;
      while (i5 < stepBlock.length) {
        const ch = stepBlock[i5];
        if (ch === '[') depth5++;
        else if (ch === ']') { depth5--; if (depth5 === 0) { listClose = i5; break; } }
        i5++;
      }
      if (listClose === -1) return;

      // Determine a clean parent id: try group*10; if taken, use max+1
      const globalListOpen = localOffset + listOpen;
      const globalListClose = localOffset + listClose;
      const lessonsContent = src.slice(globalListOpen, globalListClose);
      const parentIdCandidates = Array.from(lessonsContent.matchAll(/\bid:\s*(\d+),/g)).map(m => Number(m[1]));
      let newParentId = group * 10;
      if (parentIdCandidates.includes(newParentId)) {
        newParentId = (parentIdCandidates.length ? Math.max(...parentIdCandidates) + 1 : newParentId);
      }
      const parentBlock = `\n      {\n        id: ${newParentId},\n        title: "${`New Lesson ${group}`}",\n        description: "",\n        lessonType: "info",\n        unlockRequirements: {},\n        sublessons: [\n          { id: ${numLessonId}, title: "${String(title || 'New Sublesson').replace(/"/g, '\\"')}", description: "", lessonType: "info" },\n        ],\n      },`;
      src = src.slice(0, globalListClose) + parentBlock + '\n' + src.slice(globalListClose);
      fs.writeFileSync(registryPath, src, 'utf8');
    })();

    // Update LessonScreen mapping/import
    ;(function updateLessonScreen() {
      if (!fs.existsSync(lessonScreenPath)) return;
      let src = fs.readFileSync(lessonScreenPath, 'utf8');
      const importLine = `import { lessonSteps as lesson${Number(lessonId)}Steps } from "../modules/lessons/step${Number(step)}/lesson${Number(lessonId)}";`;
      if (!src.includes(importLine)) {
        const importAnchor = /import\s+\{\s*lessonSteps\s+as\s+lesson\d+Steps\s*\}\s+from\s+"\.\.\/modules\/lessons\/step\d+\/lesson\d+";?/g;
        let lastMatch = null, m;
        while ((m = importAnchor.exec(src)) !== null) lastMatch = m;
        if (lastMatch) {
          const idx = lastMatch.index + lastMatch[0].length;
          src = src.slice(0, idx) + "\n" + importLine + src.slice(idx);
        } else {
          const typeImport = 'import { LessonStep } from "../modules/lessons/types";';
          const idx = src.indexOf(typeImport);
          if (idx !== -1) {
            const nl = src.indexOf('\n', idx) + 1;
            src = src.slice(0, nl) + importLine + "\n" + src.slice(nl);
          } else {
            src = importLine + "\n" + src;
          }
        }
      }
      const mapStart = src.indexOf('const lessonSteps: Record<number, LessonStep[]> = {');
      if (mapStart !== -1 && !src.includes(`${Number(lessonId)}: lesson${Number(lessonId)}Steps`)) {
        const mapOpen = src.indexOf('{', mapStart);
        let i = mapOpen, depth = 0, closeIdx = -1;
        while (i < src.length) { const ch = src[i]; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { closeIdx = i; break; } } i++; }
        if (closeIdx !== -1) {
          const insertion = `\n  ${Number(lessonId)}: lesson${Number(lessonId)}Steps,`;
          src = src.slice(0, closeIdx) + insertion + "\n" + src.slice(closeIdx);
        }
      }
      fs.writeFileSync(lessonScreenPath, src, 'utf8');
    })();

    res.json({ ok: true });
  } catch (e) {
    console.error('exportLesson error:', e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

module.exports = router;


