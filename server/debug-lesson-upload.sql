-- Debug queries - Run these one by one to find the issue

-- 1. Check if Unit 1 exists
SELECT id, index, title FROM "Unit" WHERE index = 1;

-- 2. Check if Lesson code 3 exists (parent lesson)
SELECT id, code, title, parentlessonid FROM "Lesson" WHERE code = 3;

-- 3. Check if Lesson code 302 already exists
SELECT id, code, title FROM "Lesson" WHERE code = 302;

-- 4. Try to manually get the IDs needed
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 3 LIMIT 1
)
SELECT 
  u.id as unit_id,
  pl.id as parent_lesson_id,
  CASE WHEN u.id IS NULL THEN 'Unit 1 NOT FOUND' ELSE 'Unit 1 OK' END as unit_status,
  CASE WHEN pl.id IS NULL THEN 'Lesson 3 NOT FOUND' ELSE 'Lesson 3 OK' END as lesson_status
FROM unit1 u
FULL OUTER JOIN parent_lesson pl ON true;

-- 5. If the above shows Unit 1 and Lesson 3 exist, try this simplified insert:
-- (Only run this after verifying Unit 1 and Lesson 3 exist)
/*
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 3 LIMIT 1
)
INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
SELECT
  u.id,
  302,
  'סוגי נכסים',
  'לימוד על סוגים שונים של נכסים פיננסיים: אג"ח, סחורות, מט"ח, ומטבעות דיגיטליים',
  'info',
  pl.id
FROM unit1 u, parent_lesson pl
ON CONFLICT (code)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  parentlessonid = EXCLUDED.parentlessonid
RETURNING id, code, title;
*/

