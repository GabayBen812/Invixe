const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function loadTypescriptModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  const func = new Function('module', 'exports', transpiled);
  func(m, m.exports);
  return m.exports;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const appRoot = path.resolve(repoRoot, '..', 'invixe-app');
  const lessonsDir = path.resolve(appRoot, 'src', 'modules', 'lessons');
  const registryPath = path.resolve(lessonsDir, 'registry.ts');

  if (!fs.existsSync(registryPath)) {
    console.error('registry.ts not found at', registryPath);
    process.exit(1);
  }

  const registrySrc = fs.readFileSync(registryPath, 'utf8');
  const exportMatch = registrySrc.match(/export const lessonsRegistry:\s*StepRegistry\[]\s*=\s*(\[([\s\S]*)\]);/);
  if (!exportMatch) {
    console.error('Could not parse lessonsRegistry from registry.ts');
    process.exit(1);
  }

  // Evaluate the array in a sandbox by turning it into module.exports = [...]
  const arrayText = exportMatch[1];
  const tempModuleCode = `module.exports = ${arrayText};`;
  const transpiled = ts.transpileModule(tempModuleCode, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  const fn = new Function('module', 'exports', transpiled);
  fn(mod, mod.exports);
  const lessonsRegistry = mod.exports;

  // Upsert steps, lessons, sublessons
  for (const stepBlock of lessonsRegistry) {
    const step = await prisma.step.upsert({
      where: { stepNumber: stepBlock.step },
      create: { stepNumber: stepBlock.step },
      update: {},
    });
    for (const lesson of (stepBlock.lessons || [])) {
      const lessonMeta = await prisma.lessonMeta.upsert({
        where: { numericId: lesson.id },
        create: {
          numericId: lesson.id,
          title: lesson.title,
          description: lesson.description || '',
          lessonType: lesson.lessonType,
          unlockMinPoints: lesson.unlockRequirements?.minimumPoints || null,
          prerequisites: lesson.unlockRequirements?.completedLessons || [],
          stepId: step.id,
        },
        update: {
          title: lesson.title,
          description: lesson.description || '',
          lessonType: lesson.lessonType,
          unlockMinPoints: lesson.unlockRequirements?.minimumPoints || null,
          prerequisites: lesson.unlockRequirements?.completedLessons || [],
          stepId: step.id,
        },
      });

      // Sublessons
      if (lesson.sublessons && lesson.sublessons.length) {
        for (const sl of lesson.sublessons) {
          await prisma.sublesson.upsert({
            where: { numericId: sl.id },
            create: {
              numericId: sl.id,
              title: sl.title,
              description: sl.description || '',
              lessonType: sl.lessonType,
              lessonId: lessonMeta.id,
            },
            update: {
              title: sl.title,
              description: sl.description || '',
              lessonType: sl.lessonType,
              lessonId: lessonMeta.id,
            },
          });
        }
      }
    }
  }

  // Import lesson steps JSON from files: invixe-app/src/modules/lessons/step{n}/lesson{ID}.ts
  const stepDirs = fs.readdirSync(lessonsDir).filter((d) => d.startsWith('step'));
  for (const dir of stepDirs) {
    const fullDir = path.resolve(lessonsDir, dir);
    const files = fs.readdirSync(fullDir).filter((f) => /^lesson\d+\.ts$/.test(f));
    for (const f of files) {
      const p = path.resolve(fullDir, f);
      const lessonIdMatch = f.match(/lesson(\d+)\.ts/);
      if (!lessonIdMatch) continue;
      const lessonNumericId = Number(lessonIdMatch[1]);

      // Transpile the TS module and read its exported lessonSteps value
      const mod = loadTypescriptModule(p);
      const stepsJson = mod.lessonSteps;
      if (!Array.isArray(stepsJson)) {
        console.warn('No lessonSteps array exported from', p);
        continue;
      }

      await prisma.lessonSteps.upsert({
        where: { lessonNumericId },
        create: { lessonNumericId, stepsJson },
        update: { stepsJson },
      });
    }
  }

  console.log('Seeding lessons completed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


