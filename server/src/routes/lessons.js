const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// GET /api/lessons/registry -> StepRegistry[]
router.get('/registry', async (_req, res) => {
  try {
    const steps = await prisma.step.findMany({
      orderBy: { stepNumber: 'asc' },
      include: {
        lessons: {
          orderBy: { numericId: 'asc' },
          include: { sublessons: { orderBy: { numericId: 'asc' } } },
        },
      },
    });

    const mapped = steps.map((s) => ({
      step: s.stepNumber,
      lessons: s.lessons.map((l) => ({
        id: l.numericId,
        title: l.title,
        description: l.description || '',
        lessonType: l.lessonType,
        unlockRequirements: {
          completedLessons: l.prerequisites || [],
          minimumPoints: l.unlockMinPoints ?? undefined,
        },
        sublessons: (l.sublessons || []).map((sl) => ({
          id: sl.numericId,
          title: sl.title,
          description: sl.description || '',
          lessonType: sl.lessonType,
        })),
      })),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /lessons/registry error', err);
    if (String(_req.query.debug) === '1') {
      res.status(500).json({ error: 'Failed to load lessons registry', message: String(err && err.message ? err.message : err) });
    } else {
      res.status(500).json({ error: 'Failed to load lessons registry' });
    }
  }
});

// GET /api/lessons/:lessonId/steps -> LessonStep[]
router.get('/:lessonId/steps', async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (!Number.isFinite(lessonId)) {
      return res.status(400).json({ error: 'Invalid lessonId' });
    }

    const doc = await prisma.lessonSteps.findFirst({
      where: { lessonNumericId: lessonId },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Lesson steps not found' });
    }
    res.json(doc.stepsJson);
  } catch (err) {
    console.error('GET /lessons/:lessonId/steps error', err);
    res.status(500).json({ error: 'Failed to load lesson steps' });
  }
});

module.exports = router;

// Save lesson steps JSON for a lesson (create or update)
// POST /api/lessons/steps
// Body: { lessonNumericId: number, steps: LessonStep[] }
router.post('/steps', async (req, res) => {
  try {
    const { lessonNumericId, steps } = req.body || {};
    if (!Number.isFinite(Number(lessonNumericId)) || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Invalid body. Expect { lessonNumericId: number, steps: [] }' });
    }

    // Optional: ensure the lesson metadata exists
    const lesson = await prisma.lessonMeta.findUnique({ where: { numericId: Number(lessonNumericId) } });
    if (!lesson) {
      return res.status(404).json({ error: `Lesson ${lessonNumericId} not found in metadata` });
    }

    const saved = await prisma.lessonSteps.upsert({
      where: { lessonNumericId: Number(lessonNumericId) },
      create: { lessonNumericId: Number(lessonNumericId), stepsJson: steps },
      update: { stepsJson: steps },
    });

    res.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error('POST /lessons/steps error', err);
    res.status(500).json({ error: 'Failed to save lesson steps' });
  }
});


