-- Upload new sublesson "תנועת המחיר" (Price Movement) to lesson 3 "מסחר בשוק ההון"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1 and the parent lesson ID for lesson 3
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 3 LIMIT 1
),

-- Insert or update sublesson "תנועת המחיר"
-- Using code 303 (for third sublesson of lesson 3)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    303,
    'תנועת המחיר',
    'לימוד על מה גורם למחירי מניות לזוז: ביקוש והיצע, ומה משפיע על כיוון השוק',
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
    "message": "מחירי מניות עולים ויורדים כל הזמן. אבל מה בעצם גורם להם לזוז?  בוא נבדוק ביחד מה משפיע על כיוון השוק.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!"
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
    "message": "מה לדעתך יקרה למניה שהרבה אנשים רוצים לקנות אותה?",
    "backgroundImage": "bg1",
    "characterImg": "character_orange_noback.png",
    "bubblePosition": "center",
    "activity": "simple_question",
    "activityConfig": {
      "correctExplanation": "מעולה! זה נקרא ביקוש \nככל שיותר אנשים רוצים אותה הביקוש יותר גבוה",
      "wrongExplanation": "לא בדיוק. ככל שיותר אנשים רוצים את אותה המנייה הביקוש יותר גבוה, וכך גם המחיר.",
      "rewards": 5
    },
    "choices": [
      {
        "text": "לא יהיה שינוי",
        "nextStep": "textWithImageExplain1",
        "correct": false
      },
      {
        "text": "אי אפשר לדעת",
        "nextStep": "textWithImageExplain1",
        "correct": false
      },
      {
        "text": "המחיר יעלה ",
        "nextStep": "textWithImageExplain1",
        "correct": true
      },
      {
        "text": "המחיר ירד",
        "nextStep": "textWithImageExplain1",
        "correct": false
      }
    ]
  },
  {
    "id": "textWithImageExplain1",
    "message": "העיקרון פשוט:  ככל שיותר אנשים רוצים לקנות מניה  המחיר שלה יעלה.  ככל שיותר אנשים רוצים למכור המחיר שלה ירד.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/06a7457f-1e0a-411a-8554-95e93e2ef13b",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762087719502_7feipjivyd5.png",
        "uploadedImagePath": "text-with-image/1762087719502_7feipjivyd5.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "svg_multi_select_example"
      }
    ]
  },
  {
    "id": "svg_multi_select_example",
    "message": "אם יש יותר מוכרים מקונים מה יקרה למחיר המניה?",
    "backgroundImage": "bg2",
    "activity": "svgMultiSelect",
    "activityConfig": {
      "svgMultiSelect": {
        "title": "בחר את הנרות הנכונים",
        "submitText": "בדוק",
        "layout": "grid",
        "rewards": 10,
        "correctExplanation": "מעולה! זיהית נכון את הנרות הנכונים. כל הנרות שבחרת הם אכן חלק מהתבנית הנכונה.",
        "wrongExplanation": "לא בדיוק. הנרות הנכונים הם אלה שמרכיבים את התבנית הנכונה. נסה שוב!",
        "options": [
          {
            "id": "opt_1",
            "label": "",
            "svgCode": "",
            "correct": false,
            "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/8c889789-eaf5-4fef-80b6-99d9abcfd45a",
            "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762279179712_ra33p9i9tnq.svg",
            "svgPath": "svg-multi-select/1762279179712_ra33p9i9tnq.svg"
          },
          {
            "id": "opt_4",
            "label": "",
            "svgCode": "",
            "correct": false,
            "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/21fa0b16-589a-40f0-858e-9635096f5914",
            "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762279191223_epere414r7m.svg",
            "svgPath": "svg-multi-select/1762279191223_epere414r7m.svg"
          }
        ]
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain2"
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
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/030caaf7-c8cd-40e8-b944-cc79a881a085",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762088409258_31ayc8r8mvg.png",
        "uploadedImagePath": "text-with-image/1762088409258_31ayc8r8mvg.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": ""
      }
    ]
  }
]$json$::jsonb
FROM sublesson s
ON CONFLICT (lessonid)
DO UPDATE SET
  steps = EXCLUDED.steps,
  updated_at = NOW();

