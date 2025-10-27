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

    const byUnit = new Map(units.map(u => [u.id, { unit: { index: u.index, title: u.title, description: u.description }, lessons: [] }]));
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

    const registry = Array.from(byUnit.values()).map(({ unit, lessons }) => ({ step: unit.index, lessons }));
    return res.json(registry);
  } catch (err) {
    console.error('GET /api/v2/lessons/registry error', err);
    return res.status(500).json({ error: 'Failed to load lessons registry' });
  }
});

// GET /api/v2/lessons/:code/steps
router.get('/:code/steps', async (req, res) => {
  try {
    const supabase = getSupabase(req);
    const code = Number(req.params.code);
    if (!Number.isFinite(code)) return res.status(400).json({ error: 'Invalid code' });
    const { data: lesson, error: lErr } = await supabase
      .from('Lesson')
      .select('id')
      .eq('code', code)
      .maybeSingle();
    if (lErr) throw lErr;
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const { data: stepsDoc, error: sErr } = await supabase
      .from('LessonStepsV2')
      .select('steps')
      .eq('lessonid', lesson.id)
      .maybeSingle();
    if (sErr) throw sErr;
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


