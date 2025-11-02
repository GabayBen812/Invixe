// Add sublessons to existing lessons in Supabase
require('dotenv').config({ path: './server/.env' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, key);

  // Get existing lessons
  const { data: lessons, error: lessonErr } = await sb
    .from('Lesson')
    .select('id, code')
    .in('code', [1, 2]);
  if (lessonErr) throw lessonErr;

  const lessonByCode = new Map(lessons.map(l => [l.code, l.id]));

  // Add sublessons for lesson 1 (code 1)
  const sublessons1 = [
    {
      code: 101,
      unitid: lessons.find(l => l.code === 1)?.unitid,
      title: "Stock Market Basics",
      description: "Understanding how the stock market works",
      type: "info",
      parentlessonid: lessonByCode.get(1),
    },
    {
      code: 102,
      unitid: lessons.find(l => l.code === 1)?.unitid,
      title: "Buying and Selling",
      description: "Learn about trading stocks",
      type: "practice",
      parentlessonid: lessonByCode.get(1),
    },
  ];

  // Add sublessons for lesson 2 (code 2)
  const sublessons2 = [
    {
      code: 201,
      unitid: lessons.find(l => l.code === 2)?.unitid,
      title: "Chart Reading",
      description: "How to read stock charts",
      type: "info",
      parentlessonid: lessonByCode.get(2),
    },
    {
      code: 202,
      unitid: lessons.find(l => l.code === 2)?.unitid,
      title: "Technical Indicators",
      description: "Understanding technical analysis tools",
      type: "memorize",
      parentlessonid: lessonByCode.get(2),
    },
  ];

  // Insert all sublessons
  const allSublessons = [...sublessons1, ...sublessons2];
  const { error: sublessonErr } = await sb
    .from('Lesson')
    .upsert(allSublessons, { onConflict: 'code' });
  if (sublessonErr) throw sublessonErr;

  console.log('Sublessons added successfully');
  console.log('Added sublessons:', allSublessons.map(s => `${s.code}: ${s.title}`));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
