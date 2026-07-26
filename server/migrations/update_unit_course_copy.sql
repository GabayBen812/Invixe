-- Hebrew course titles and subtitles for the unit picker.
-- Safe to re-run: upserts by unit index.

INSERT INTO "Unit" (index, title, description) VALUES
  (
    1,
    'מבוא לשוק ההון',
    'איך הבורסה עובדת, מושגי יסוד וניהול סיכונים'
  ),
  (
    2,
    'ניתוח טכני',
    'נרות, מגמות, רמות מחיר ובניית אסטרטגיה'
  ),
  (
    3,
    'השקעות לטווח ארוך',
    'בניית תיק, פיזור והשקעה חכמה לאורך זמן'
  ),
  (
    4,
    'ניתוח פונדמנטלי',
    'הבנת חברות, דוחות, סקטורים וסימני אזהרה'
  )
ON CONFLICT (index) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;
