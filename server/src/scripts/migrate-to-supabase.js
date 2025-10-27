// One-time migration from Mongo (Prisma) to Supabase
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const prisma = new PrismaClient();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Helpers
  async function upsert(table, values, conflict) {
    const { data, error } = await supabase.from(table).upsert(values, conflict ? { onConflict: conflict } : undefined).select();
    if (error) throw error;
    return data;
  }

  try {
    // Steps -> LessonMeta -> Sublesson
    const steps = await prisma.step.findMany({
      orderBy: { stepNumber: 'asc' },
      include: { lessons: { include: { sublessons: true } } },
    });

    for (const s of steps) {
      const [stepRow] = await upsert('Step', [{ stepnumber: s.stepNumber }], 'stepnumber');
      for (const l of s.lessons) {
        const [lessonRow] = await upsert('LessonMeta', [{
          numericid: l.numericId,
          title: l.title,
          description: l.description || '',
          lessontype: l.lessonType,
          unlockminpoints: l.unlockMinPoints ?? null,
          prerequisites: l.prerequisites || [],
          stepid: stepRow.id,
        }], 'numericid');
        if (l.sublessons && l.sublessons.length) {
          const subRows = l.sublessons.map(sl => ({
            numericid: sl.numericId,
            title: sl.title,
            description: sl.description || '',
            lessontype: sl.lessonType,
            lessonid: lessonRow.id,
          }));
          if (subRows.length) await upsert('Sublesson', subRows, 'numericid');
        }
      }
    }

    // LessonSteps
    const stepsDocs = await prisma.lessonSteps.findMany();
    if (stepsDocs.length) {
      const chunkSize = 500;
      for (let i = 0; i < stepsDocs.length; i += chunkSize) {
        const chunk = stepsDocs.slice(i, i + chunkSize).map(d => ({
          lessonnumericid: d.lessonNumericId,
          stepsjson: d.stepsJson,
        }));
        await upsert('LessonSteps', chunk, 'lessonnumericid');
      }
    }

    // Users
    const users = await prisma.user.findMany({ include: { progress: true, lessonAttempts: true, portfolio: true } });
    for (const u of users) {
      const [uRow] = await upsert('User', [{
        email: u.email,
        name: u.name || null,
        password: u.password,
        agegroup: u.ageGroup,
        goal: u.goal,
        coins: u.coins || 0,
        lightnings: u.lightnings || 0,
      }], 'email');

      if (u.progress && u.progress.length) {
        const rows = u.progress.map(p => ({ userid: uRow.id, lessonid: String(p.lessonId || ''), completed: !!p.completed }));
        if (rows.length) await supabase.from('Progress').insert(rows);
      }

      if (u.lessonAttempts && u.lessonAttempts.length) {
        const rows = u.lessonAttempts.map(a => ({
          userid: uRow.id,
          lessonid: String(a.lessonId || ''),
          completed: !!a.completed,
          lastattempted: a.lastAttempted,
          attempts: a.attempts || 1,
        }));
        if (rows.length) await supabase.from('LessonAttempt').insert(rows);
      }

      if (u.portfolio && u.portfolio.length) {
        const rows = u.portfolio.map(p => ({
          userid: uRow.id,
          symbol: p.symbol,
          shares: p.shares,
          avgprice: p.avgPrice,
          createdat: p.createdAt,
          updatedat: p.updatedAt,
        }));
        if (rows.length) await supabase.from('Portfolio').insert(rows);
      }
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();


