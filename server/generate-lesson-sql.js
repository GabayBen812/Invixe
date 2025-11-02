// Script to generate SQL for uploading lesson from lesson.json
const fs = require('fs');
const path = require('path');

// Read the lesson.json file
const lessonJsonPath = 'C:/Users/7ben7/Downloads/lesson.json';
const lessonData = JSON.parse(fs.readFileSync(lessonJsonPath, 'utf8'));

// Convert lesson data to JSON string with proper escaping for SQL
const stepsJson = JSON.stringify(lessonData).replace(/'/g, "''");

// Generate SQL
const sql = `-- Upload new lesson "מושגים והיכרות כללית" with sublesson "סוגי שווקים" to unit 1
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),

-- Insert or update main lesson "מושגים והיכרות כללית"
-- Using code 3 (assuming 1 and 2 are already taken - adjust if needed)
main_lesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type)
  SELECT 
    u.id,
    3,
    'מושגים והיכרות כללית',
    'מבוא למושגים בסיסיים בשוקי ההון',
    'info'
  FROM unit1 u
  ON CONFLICT (code) 
  DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    unitid = EXCLUDED.unitid
  RETURNING id, code
),

-- Insert or update sublesson "סוגי שווקים"
-- Using code 301 (for sublesson of lesson 3)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT 
    u.id,
    301,
    'סוגי שווקים',
    'לימוד על סוגים שונים של שווקים פיננסיים',
    'info',
    ml.id
  FROM unit1 u, main_lesson ml
  ON CONFLICT (code)
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    parentlessonid = EXCLUDED.parentlessonid
  RETURNING id, code
)

-- Insert or update lesson steps for the sublesson
INSERT INTO "LessonStepsV2" (lessonid, steps)
SELECT 
  s.id,
  '${stepsJson}'::jsonb
FROM sublesson s
ON CONFLICT (lessonid)
DO UPDATE SET
  steps = EXCLUDED.steps,
  updated_at = NOW();`;

// Write to SQL file
const outputPath = path.join(__dirname, 'upload-new-lesson.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`SQL file generated at: ${outputPath}`);
console.log(`\nLesson has ${lessonData.length} steps`);

