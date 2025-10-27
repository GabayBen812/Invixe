const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const router = Router();
const prisma = new PrismaClient();

// Supabase client per request (fallback to prisma if not configured yet)
function getSupabase(req) {
  const sb = req.app.get('supabase');
  return sb || null;
}

// GET /api/lessons/registry -> StepRegistry[]
router.get('/registry', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      const { data: steps, error: stepsErr } = await supabase
        .from('Step')
        .select('stepnumber, LessonMeta(*, Sublesson(*))')
        .order('stepnumber', { ascending: true });
      if (stepsErr) throw stepsErr;
      const mapped = (steps || []).map((s) => ({
        step: s.stepnumber,
        lessons: (s.LessonMeta || []).sort((a,b)=>a.numericid-b.numericid).map((l) => ({
          id: l.numericid,
          title: l.title,
          description: l.description || '',
          lessonType: l.lessontype,
          unlockRequirements: {
            completedLessons: l.prerequisites || [],
            minimumPoints: l.unlockminpoints ?? undefined,
          },
          sublessons: (l.Sublesson || []).sort((a,b)=>a.numericid-b.numericid).map((sl) => ({
            id: sl.numericid,
            title: sl.title,
            description: sl.description || '',
            lessonType: sl.lessontype,
          })),
        })),
      }));
      return res.json(mapped);
    }

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

    const supabase = getSupabase(req);
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      const { data, error } = await supabase
        .from('LessonSteps')
        .select('stepsJson')
        .eq('lessonnumericid', lessonId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Lesson steps not found' });
      return res.json(data.stepsjson);
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

// -------------------------
// DB-first authoring endpoints
// -------------------------

// Create a lesson metadata under a step
// POST /api/lessons
// Body: { stepNumber, numericId, title, description?, lessonType, unlockRequirements? }
router.post('/', async (req, res) => {
  try {
    const { stepNumber, numericId, title, description = '', lessonType, unlockRequirements = {} } = req.body || {};
    const stepNum = Number(stepNumber);
    const numeric = Number(numericId);
    if (!Number.isFinite(stepNum) || !Number.isFinite(numeric) || !title || !lessonType) {
      return res.status(400).json({ error: 'Invalid body. Expect { stepNumber, numericId, title, lessonType, ... }' });
    }

    const supabase = getSupabase(req);
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      // Ensure step
      const { data: stepRow, error: stepErr } = await supabase
        .from('Step')
        .upsert({ stepnumber: stepNum }, { onConflict: 'stepnumber' })
        .select('id')
        .maybeSingle();
      if (stepErr) throw stepErr;
      const stepId = stepRow?.id;
      const { data: saved, error: saveErr } = await supabase
        .from('LessonMeta')
        .upsert({
          numericid: numeric,
          title,
          description: description || '',
          lessontype: lessonType,
          unlockminpoints: unlockRequirements.minimumPoints ?? null,
          prerequisites: unlockRequirements.completedLessons || [],
          stepid: stepId,
        }, { onConflict: 'numericid' })
        .select('id')
        .maybeSingle();
      if (saveErr) throw saveErr;
      return res.json({ ok: true, id: saved?.id });
    }

    // Fallback to Prisma (Mongo)
    const step = await prisma.step.upsert({ where: { stepNumber: stepNum }, create: { stepNumber: stepNum }, update: {} });
    const saved = await prisma.lessonMeta.upsert({
      where: { numericId: numeric },
      create: { numericId: numeric, title, description: description || '', lessonType, unlockMinPoints: unlockRequirements.minimumPoints ?? null, prerequisites: unlockRequirements.completedLessons || [], stepId: step.id },
      update: { title, description: description || '', lessonType, unlockMinPoints: unlockRequirements.minimumPoints ?? null, prerequisites: unlockRequirements.completedLessons || [], stepId: step.id },
    });
    return res.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error('POST /lessons error', err);
    return res.status(500).json({ error: 'Failed to create/update lesson' });
  }
});

// Update lesson metadata
// PATCH /api/lessons/:numericId
router.patch('/:numericId', async (req, res) => {
  try {
    const numeric = Number(req.params.numericId);
    if (!Number.isFinite(numeric)) return res.status(400).json({ error: 'Invalid numericId' });

    const { title, description, lessonType, unlockRequirements, stepNumber } = req.body || {};

    const supabase = getSupabase(req);
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      let stepIdUpdate;
      if (Number.isFinite(Number(stepNumber))) {
        const { data: stepRow, error: sErr } = await supabase
          .from('Step')
          .upsert({ stepnumber: Number(stepNumber) }, { onConflict: 'stepnumber' })
          .select('id')
          .maybeSingle();
        if (sErr) throw sErr;
        stepIdUpdate = stepRow?.id;
      }
      const payload = {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(lessonType !== undefined ? { lessontype: lessonType } : {}),
        ...(unlockRequirements !== undefined ? { unlockminpoints: unlockRequirements.minimumPoints ?? null, prerequisites: unlockRequirements.completedLessons || [] } : {}),
        ...(stepIdUpdate !== undefined ? { stepid: stepIdUpdate } : {}),
      };
      const { data: saved, error: upErr } = await supabase
        .from('LessonMeta')
        .update(payload)
        .eq('numericid', numeric)
        .select('id')
        .maybeSingle();
      if (upErr) throw upErr;
      if (!saved) return res.status(404).json({ error: 'Lesson not found' });
      return res.json({ ok: true, id: saved.id });
    }

    // Fallback Prisma
    let stepIdUpdate = undefined;
    if (Number.isFinite(Number(stepNumber))) {
      const step = await prisma.step.upsert({ where: { stepNumber: Number(stepNumber) }, create: { stepNumber: Number(stepNumber) }, update: {} });
      stepIdUpdate = step.id;
    }
    const saved = await prisma.lessonMeta.update({
      where: { numericId: numeric },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        lessonType: lessonType ?? undefined,
        unlockMinPoints: unlockRequirements ? (unlockRequirements.minimumPoints ?? null) : undefined,
        prerequisites: unlockRequirements ? (unlockRequirements.completedLessons || []) : undefined,
        stepId: stepIdUpdate,
      },
    });
    return res.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error('PATCH /lessons/:numericId error', err);
    if (String(err && err.code) === 'P2025') {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    return res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Add or upsert sublessons for a lesson
// POST /api/lessons/:numericId/sublessons
// Body: { sublessons: [{ numericId, title, description?, lessonType }] }
router.post('/:numericId/sublessons', async (req, res) => {
  try {
    const numeric = Number(req.params.numericId);
    if (!Number.isFinite(numeric)) return res.status(400).json({ error: 'Invalid numericId' });
    const { sublessons } = req.body || {};
    if (!Array.isArray(sublessons)) return res.status(400).json({ error: 'Invalid body: sublessons[] required' });

    const supabase = getSupabase(req);
    if (supabase && req.app.get('SUPABASE_ONLY')) {
      const { data: lessonRow, error: lErr } = await supabase
        .from('LessonMeta')
        .select('id')
        .eq('numericid', numeric)
        .maybeSingle();
      if (lErr) throw lErr;
      if (!lessonRow) return res.status(404).json({ error: 'Lesson not found' });
      const results = [];
      for (const sl of sublessons) {
        const slId = Number(sl.numericId);
        if (!Number.isFinite(slId) || !sl.title || !sl.lessonType) {
          return res.status(400).json({ error: 'Each sublesson requires numericId, title, lessonType' });
        }
        const { data: saved, error: sErr } = await supabase
          .from('Sublesson')
          .upsert({
            numericid: slId,
            title: sl.title,
            description: sl.description || '',
            lessontype: sl.lessonType,
            lessonid: lessonRow.id,
          }, { onConflict: 'numericid' })
          .select('id, numericid')
          .maybeSingle();
        if (sErr) throw sErr;
        results.push({ id: saved?.id, numericId: saved?.numericid });
      }
      return res.json({ ok: true, sublessons: results });
    }

    // Fallback Prisma
    const lesson = await prisma.lessonMeta.findUnique({ where: { numericId: numeric } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const results = [];
    for (const sl of sublessons) {
      const slId = Number(sl.numericId);
      if (!Number.isFinite(slId) || !sl.title || !sl.lessonType) {
        return res.status(400).json({ error: 'Each sublesson requires numericId, title, lessonType' });
      }
      const saved = await prisma.sublesson.upsert({ where: { numericId: slId }, create: { numericId: slId, title: sl.title, description: sl.description || '', lessonType: sl.lessonType, lessonId: lesson.id }, update: { title: sl.title, description: sl.description || '', lessonType: sl.lessonType, lessonId: lesson.id } });
      results.push({ id: saved.id, numericId: slId });
    }
    return res.json({ ok: true, sublessons: results });
  } catch (err) {
    console.error('POST /lessons/:numericId/sublessons error', err);
    return res.status(500).json({ error: 'Failed to upsert sublessons' });
  }
});

// Replace steps for a lesson (DB authoritative)
// PUT /api/lessons/:numericId/steps
// Body: { steps: LessonStep[] }
router.put('/:numericId/steps', async (req, res) => {
  try {
    const numeric = Number(req.params.numericId);
    if (!Number.isFinite(numeric)) return res.status(400).json({ error: 'Invalid numericId' });
    const { steps } = req.body || {};
    if (!Array.isArray(steps)) return res.status(400).json({ error: 'Invalid body: steps[] required' });

    const supabase = getSupabase(req);
    if (supabase) {
      const { data: exists, error: lErr } = await supabase
        .from('LessonMeta')
        .select('id')
        .eq('numericid', numeric)
        .maybeSingle();
      if (lErr) throw lErr;
      if (!exists) return res.status(404).json({ error: 'Lesson not found in metadata' });
      const { data: saved, error: sErr } = await supabase
        .from('LessonSteps')
        .upsert({ lessonnumericid: numeric, stepsjson: steps }, { onConflict: 'lessonnumericid' })
        .select('id')
        .maybeSingle();
      if (sErr) throw sErr;
      return res.json({ ok: true, id: saved?.id });
    }

    // Fallback Prisma
    const lesson = await prisma.lessonMeta.findUnique({ where: { numericId: numeric } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found in metadata' });
    const saved = await prisma.lessonSteps.upsert({ where: { lessonNumericId: numeric }, create: { lessonNumericId: numeric, stepsJson: steps }, update: { stepsJson: steps } });
    return res.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error('PUT /lessons/:numericId/steps error', err);
    return res.status(500).json({ error: 'Failed to save lesson steps' });
  }
});

// Deprecated: Save lesson steps (old path)
// POST /api/lessons/steps
router.post('/steps', async (req, res) => {
  try {
    const { lessonNumericId, steps } = req.body || {};
    if (!Number.isFinite(Number(lessonNumericId)) || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Invalid body. Expect { lessonNumericId: number, steps: [] }' });
    }
    const lesson = await prisma.lessonMeta.findUnique({ where: { numericId: Number(lessonNumericId) } });
    if (!lesson) {
      return res.status(404).json({ error: `Lesson ${lessonNumericId} not found in metadata` });
    }
    const saved = await prisma.lessonSteps.upsert({
      where: { lessonNumericId: Number(lessonNumericId) },
      create: { lessonNumericId: Number(lessonNumericId), stepsJson: steps },
      update: { stepsJson: steps },
    });
    res.set('Deprecation', 'true');
    res.json({ ok: true, id: saved.id, notice: 'Use PUT /api/lessons/:numericId/steps' });
  } catch (err) {
    console.error('POST /lessons/steps error', err);
    res.status(500).json({ error: 'Failed to save lesson steps' });
  }
});

