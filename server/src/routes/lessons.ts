import { Router, Request, Response } from 'express';
import { PrismaClient, LessonType } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/lessons/registry -> StepRegistry[]
router.get('/registry', async (_req: Request, res: Response) => {
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
        lessonType: l.lessonType as unknown as 'memorize' | 'info' | 'test' | 'practice',
        unlockRequirements: {
          completedLessons: l.prerequisites || [],
          minimumPoints: l.unlockMinPoints ?? undefined,
        },
        sublessons: (l.sublessons || []).map((sl) => ({
          id: sl.numericId,
          title: sl.title,
          description: sl.description || '',
          lessonType: sl.lessonType as unknown as 'memorize' | 'info' | 'test' | 'practice',
        })),
      })),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('GET /lessons/registry error', err);
    res.status(500).json({ error: 'Failed to load lessons registry' });
  }
});

// GET /api/lessons/:lessonId/steps -> LessonStep[]
router.get('/:lessonId/steps', async (req: Request, res: Response) => {
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
    res.json(doc.stepsJson as unknown);
  } catch (err) {
    console.error('GET /lessons/:lessonId/steps error', err);
    res.status(500).json({ error: 'Failed to load lesson steps' });
  }
});

export default router;


