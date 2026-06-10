-- Fix misclassified practice (תרגול) lessons in the Lesson table.

-- Trim bad values first (e.g. 'lesson\n')
UPDATE "Lesson" SET type = trim(type);

-- Legacy "lesson" rows: תרגול in title → practice, otherwise theory → info
UPDATE "Lesson"
SET type = 'practice'
WHERE trim(type) = 'lesson'
  AND title ~ 'תרגול';

UPDATE "Lesson"
SET type = 'info'
WHERE trim(type) = 'lesson'
  AND title !~ 'תרגול';

-- Mis-typed info lessons that are actually תרגול
UPDATE "Lesson"
SET type = 'practice'
WHERE trim(type) = 'info'
  AND title ~ 'תרגול';
