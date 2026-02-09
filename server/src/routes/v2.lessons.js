const { Router } = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = Router();

function getSupabase(req) {
  const sb = req.app.get('supabase');
  if (!sb) throw new Error('Supabase is not configured');
  return sb;
}

// GET /api/v2/lessons/registry
router.get('/registry', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { data: units, error: uErr } = await supabase
      .from('Unit')
      .select('id, index, title, description')
      .order('index', { ascending: true });
    if (uErr) throw uErr;

    // Fetch lessons grouped by unit; include children (sublessons)
    const { data: lessons, error: lErr } = await supabase
      .from('Lesson')
      .select('id, unitid, code, title, description, type, parentlessonid')
      .order('code', { ascending: true });
    if (lErr) throw lErr;

    const byUnit = new Map(
      (units || []).map(u => [
        u.id,
        {
          unit: {
            id: u.id,
            index: u.index,
            title: u.title,
            description: u.description,
          },
          lessons: [],
        },
      ]),
    );
    const lessonById = new Map();
    (lessons || []).forEach(l => lessonById.set(l.id, { id: l.code, title: l.title, description: l.description, lessonType: l.type, sublessons: [] }));
    (lessons || []).forEach(l => {
      const entry = lessonById.get(l.id);
      if (l.parentlessonid) {
        const parent = lessonById.get(l.parentlessonid);
        if (parent) parent.sublessons.push({ id: entry.id, title: entry.title, description: entry.description, lessonType: entry.lessonType });
      } else {
        const bucket = byUnit.get(l.unitid);
        if (bucket) bucket.lessons.push(entry);
      }
    });

    const registry = Array.from(byUnit.entries()).map(([unitId, { unit, lessons }]) => ({
      step: unit.index,
      unitId,
      lessons,
    }));
    return res.json(registry);
  } catch (err) {
    console.error('GET /api/v2/lessons/registry error', err);
    return res.status(500).json({ error: 'Failed to load lessons registry' });
  }
});

// GET /api/v2/lessons/:code/steps
// Optional query: ?unitId=<uuid>
// When unitId is provided, we return the lesson that matches BOTH code and unit.
// This fixes the case where the same code is reused across multiple units.
router.get('/:code/steps', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const code = Number(req.params.code);
    if (!Number.isFinite(code)) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    const unitId = req.query.unitId ? String(req.query.unitId) : null;
    console.log('[v2.lessons] GET /:code/steps', { code, unitId });

    // Base query: by code
    let lessonsQuery = supabase
      .from('Lesson')
      .select('id, unitid')
      .eq('code', code)
      .order('id', { ascending: true })
      .limit(1);

    // If unitId is provided, further constrain by unitid
    if (unitId) {
      lessonsQuery = lessonsQuery.eq('unitid', unitId);
    }

    const { data: lessonRows, error: lErr } = await lessonsQuery;
    if (lErr) throw lErr;

    const lesson = (lessonRows || [])[0];
    if (lesson) {
      console.log('[v2.lessons] matched lesson by code+unit', {
        code,
        unitId,
        lessonId: lesson.id,
        lessonUnitId: lesson.unitid,
      });
    }

    // If we didn't find a lesson with this code+unit combination, fall back to "any lesson with this code"
    // This preserves previous behaviour for older clients or data where unitId isn't wired up yet.
    if (!lesson) {
      console.log('[v2.lessons] no lesson for code+unit, falling back to first by code', {
        code,
        unitId,
      });
      const { data: fallbackRows, error: fErr } = await supabase
        .from('Lesson')
        .select('id, unitid')
        .eq('code', code)
        .order('id', { ascending: true })
        .limit(1);
      if (fErr) throw fErr;
      const fallbackLesson = (fallbackRows || [])[0];
      if (!fallbackLesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
      const { data: stepsRows, error: sErr } = await supabase
        .from('LessonStepsV2')
        .select('steps')
        .eq('lessonid', fallbackLesson.id)
        .order('id', { ascending: true })
        .limit(1);
      if (sErr) throw sErr;
      const stepsDoc = (stepsRows || [])[0];
      if (!stepsDoc) return res.status(404).json({ error: 'Lesson steps not found' });
      return res.json(stepsDoc.steps);
    }

    const { data: stepsRows, error: sErr } = await supabase
      .from('LessonStepsV2')
      .select('steps')
      .eq('lessonid', lesson.id)
      .order('id', { ascending: true })
      .limit(1);
    if (sErr) throw sErr;
    const stepsDoc = (stepsRows || [])[0];
    if (!stepsDoc) return res.status(404).json({ error: 'Lesson steps not found' });
    return res.json(stepsDoc.steps);
  } catch (err) {
    console.error('GET /api/v2/lessons/:code/steps error', err);
    return res.status(500).json({ error: 'Failed to load steps' });
  }
});

// POST /api/v2/lessons  (create lesson or sublesson)
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const { unitIndex, code, title, type, description = '', prerequisites = [], unlockMinPoints = null, parentCode } = req.body || {};
    if (!Number.isFinite(Number(code)) || !title || !type) return res.status(400).json({ error: 'Invalid body' });
    let unitId = null;
    if (Number.isFinite(Number(unitIndex))) {
      const { data: unitRow, error: uErr } = await supabase
        .from('Unit')
        .upsert({ index: Number(unitIndex) }, { onConflict: 'index' })
        .select('id')
        .maybeSingle();
      if (uErr) throw uErr;
      unitId = unitRow?.id ?? null;
    }
    let parentLessonId = null;
    if (Number.isFinite(Number(parentCode))) {
      const { data: pRow, error: pErr } = await supabase
        .from('Lesson')
        .select('id')
        .eq('code', Number(parentCode))
        .maybeSingle();
      if (pErr) throw pErr;
      parentLessonId = pRow?.id ?? null;
    }
    const { data: saved, error: sErr } = await supabase
      .from('Lesson')
      .upsert({
        unitid: unitId,
        code: Number(code),
        title,
        description,
        type,
        prerequisites,
        unlockminpoints: unlockMinPoints,
        parentlessonid: parentLessonId,
      }, { onConflict: 'code' })
      .select('id')
      .maybeSingle();
    if (sErr) throw sErr;
    return res.json({ ok: true, id: saved?.id });
  } catch (err) {
    console.error('POST /api/v2/lessons error', err);
    return res.status(500).json({ error: 'Failed to create/update lesson' });
  }
});

// PUT /api/v2/lessons/:code/steps
router.put('/:code/steps', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const code = Number(req.params.code);
    if (!Number.isFinite(code)) return res.status(400).json({ error: 'Invalid code' });
    const { steps } = req.body || {};
    if (!Array.isArray(steps)) return res.status(400).json({ error: 'steps[] required' });
    const { data: lesson, error: lErr } = await supabase
      .from('Lesson')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    if (lErr) throw lErr;
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const { data: saved, error: sErr } = await supabase
      .from('LessonStepsV2')
      .upsert({ lessonid: lesson.id, steps }, { onConflict: 'lessonid' })
      .select('id')
      .maybeSingle();
    if (sErr) throw sErr;
    return res.json({ ok: true, id: saved?.id });
  } catch (err) {
    console.error('PUT /api/v2/lessons/:code/steps error', err);
    return res.status(500).json({ error: 'Failed to save steps' });
  }
});

module.exports = router;


