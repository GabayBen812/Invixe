-- Upload new sublesson "מדדים" (Indices) to lesson 2 "סוגי נכסים"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1 and the parent lesson ID for lesson 2
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 2 LIMIT 1
),

-- Insert or update sublesson "מדדים"
-- Using code 202 (for second sublesson of lesson 2)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    202,
    'מדדים',
    'לימוד על מדדי מניות, כולל S&P 500 ואיך הם משקפים את מצב השוק',
    'info',
    pl.id
  FROM unit1 u, parent_lesson pl
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
  $json$[
  {
    "id": "textWithImageExplain",
    "message": "מדד הוא ציון שמייצג את הביצועים של קבוצת מניות.  הוא מחבר את כולן לערך אחד  לפעמים כל מניה משפיעה בו בצורה שווה, ולפעמים לפי הגודל החברה.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/6381368d-4e05-4d4e-88e1-163f3f311f05",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761914018583_7vk4kl0r8ja.png",
        "uploadedImagePath": "text-with-image/1761914018583_7vk4kl0r8ja.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "simple_question"
      }
    ]
  },
  {
    "id": "simple_question",
    "message": "המדד המשמעותי והמוכר ביותר בארה״ב נקרא  S&P 500 ? מה לדעתך הוא כולל",
    "backgroundImage": "bg1",
    "characterImg": "character_orange_noback.png",
    "bubblePosition": "center",
    "activity": "simple_question",
    "activityConfig": {
      "correctExplanation": "",
      "wrongExplanation": "",
      "rewards": 5
    },
    "choices": [
      {
        "text": "500 חברות אמריקאיות שמרוויחות מעל מיליארד דולר בשנה",
        "nextStep": "textWithImageExplain3",
        "correct": false
      },
      {
        "text": "500 החברות הגדולות בארה״ב לפי שווי שוק",
        "nextStep": "textWithImageExplain3",
        "correct": true
      },
      {
        "text": "כל המניות שנסחרות בבורסה של ניו יורק",
        "nextStep": "textWithImageExplain3",
        "correct": false
      },
      {
        "text": "רק חברות טכנולוגיה מובילות כמו אפל, גוגל ומיקרוסופט",
        "nextStep": "textWithImageExplain3",
        "correct": false
      }
    ]
  },
  {
    "id": "svg_multi_select_example",
    "message": "אמת או שקר? אם המדד עלה, רוב המניות שבתוכו גם עלו.",
    "backgroundImage": "bg2",
    "activity": "svgMultiSelect",
    "activityConfig": {
      "svgOptions": [
        {
          "id": "opt_3",
          "label": "שקר",
          "svgCode": "",
          "correct": true,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/c02965bd-f937-4834-9521-6fedb96d5ac0",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762273284886_amma7o687s.svg",
          "svgPath": "svg-multi-select/1762273284886_amma7o687s.svg"
        },
        {
          "id": "opt_4",
          "label": "אמת",
          "svgCode": "",
          "correct": false,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/b828106b-23bb-446e-9c63-6c9c005324b9",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762273296569_or6ullr1a4a.svg",
          "svgPath": "svg-multi-select/1762273296569_or6ullr1a4a.svg"
        }
      ],
      "layout": "grid",
      "submitText": "בדוק",
      "correctExplanation": "מעולה! לא כל המניות שבמדד שוות אותו דבר יש מניות שאם הן עולות או יורדות יש לזה משמעות גדולה יותר במדד",
      "wrongExplanation": "שים לב! לא כל המניות שבמדד שוות אותו דבר יש מניות שאם הן עולות או יורדות יש לזה משמעות גדולה יותר במדד",
      "rewards": 10
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "simple_question1"
      }
    ]
  },
  {
    "id": "simple_question1",
    "message": "האם מדד הS&P 500 מצביע על מצב השוק בארה''ב?",
    "backgroundImage": "bg1",
    "characterImg": "character_orange_noback.png",
    "bubblePosition": "center",
    "activity": "simple_question",
    "activityConfig": {
      "correctExplanation": "נכון! למרות שהוא לא כולל את כל המניות בארה״ב, הוא מציג את ביצועי החברות הגדולות  ולכן משקף את מצב השוק.",
      "wrongExplanation": "לא בדיוק! למרות שהוא לא כולל את כל המניות בארה״ב, הוא מציג את ביצועי החברות הגדולות  ולכן משקף את מצב השוק.",
      "rewards": 5
    },
    "choices": [
      {
        "text": "לא, הוא מתייחס רק לשוק העולמי ולא לארה״ב.",
        "nextStep": "textWithImageExplain2",
        "correct": false
      },
      {
        "text": "כן, אבל רק לבורסה של ניו יורק (NYSE) ולא לכל השוק האמריקאי.",
        "nextStep": "textWithImageExplain2",
        "correct": false
      },
      {
        "text": "לא, הוא מודד רק את מניות הטכנולוגיה הגדולות.",
        "nextStep": "textWithImageExplain2",
        "correct": false
      },
      {
        "text": " כן, הוא משקף את ביצועי 500 החברות הגדולות בארה״ב ולכן מייצג את מצב השוק כולו.",
        "nextStep": "textWithImageExplain2",
        "correct": true
      }
    ]
  },
  {
    "id": "textWithImageExplain2",
    "message": "",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/a729109f-5080-4037-be2b-cc5494188dd8",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761914486897_vgxadfq475a.png",
        "uploadedImagePath": "text-with-image/1761914486897_vgxadfq475a.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": ""
      }
    ]
  },
  {
    "id": "textWithImageExplain3",
    "message": "",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/e8255fd0-11d1-4074-8aed-67c4db9ee8cf",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761916582982_7oijycbhw9r.png",
        "uploadedImagePath": "text-with-image/1761916582982_7oijycbhw9r.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "svg_multi_select_example"
      }
    ]
  }
]$json$::jsonb
FROM sublesson s
ON CONFLICT (lessonid)
DO UPDATE SET
  steps = EXCLUDED.steps,
  updated_at = NOW();

