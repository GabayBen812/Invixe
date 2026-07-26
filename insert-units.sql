-- Insert or update course units with Hebrew titles and subtitles.
-- Prefer server/migrations/update_unit_course_copy.sql for the canonical copy.

INSERT INTO "Unit" (index, title, description, created_at) VALUES
(
  2,
  'ניתוח טכני',
  'נרות, מגמות, רמות מחיר ובניית אסטרטגיה',
  NOW()
),
(
  3,
  'השקעות לטווח ארוך',
  'בניית תיק, פיזור והשקעה חכמה לאורך זמן',
  NOW()
),
(
  4,
  'ניתוח פונדמנטלי',
  'הבנת חברות, דוחות, סקטורים וסימני אזהרה',
  NOW()
)
ON CONFLICT (index) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

UPDATE "Unit"
SET
  title = 'מבוא לשוק ההון',
  description = 'איך הבורסה עובדת, מושגי יסוד וניהול סיכונים'
WHERE index = 1;
