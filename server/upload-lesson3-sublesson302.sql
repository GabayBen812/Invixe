-- Upload new sublesson "ניתוח טכני ופונדמנטלי" (Technical and Fundamental Analysis) to lesson 3 "מסחר בשוק ההון"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1 and the parent lesson ID for lesson 3
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 3 LIMIT 1
),

-- Insert or update sublesson "ניתוח טכני ופונדמנטלי"
-- Using code 302 (for second sublesson of lesson 3)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    302,
    'ניתוח טכני ופונדמנטלי',
    'לימוד על שני סוגי ניתוחים: ניתוח טכני שמבוסס על גרפים, וניתוח פונדמנטלי שבודק את מצב החברה',
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
    "message": "יש שני סוגי ניתוחים:  ניתוח טכני שמבוסס על גרפים,  וניתוח פונדמנטלי שבודק את מצב החברה.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/feda3fcd-459f-4a05-a7f0-3551360de908",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762085184338_rbpokk79ie9.png",
        "uploadedImagePath": "text-with-image/1762085184338_rbpokk79ie9.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain1"
      }
    ]
  },
  {
    "id": "textWithImageExplain1",
    "message": "בניתוח טכני אנחנו נבחן את הגרף, ועל פי תבניות ודפוסים שנלמד נוכל להעריך אם המחיר יעלה או ירד. ",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/1d4af4cd-a456-451b-979a-d5ca77e441c5",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762085247799_tqdsblslr2f.png",
        "uploadedImagePath": "text-with-image/1762085247799_tqdsblslr2f.png"
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
    "message": "מה לדעתך ננתח בניתוח  פונדמנטלי?",
    "backgroundImage": "bg1",
    "characterImg": "character_orange_noback.png",
    "bubblePosition": "center",
    "activity": "simple_question",
    "activityConfig": {
      "correctExplanation": "מעולה! ניתוח טכני הוא אכן ניתוח של גרפים ודפוסים במחירי המניות כדי לחזות תנועות עתידיות.",
      "wrongExplanation": "לא בדיוק. ניתוח טכני מתמקד בגרפים ודפוסים במחירי המניות, לא בדוחות כספיים או חדשות.",
      "rewards": 5
    },
    "choices": [
      {
        "text": "תנועות מחיר ודפוסים בגרף",
        "nextStep": "svg_multi_select_example",
        "correct": false
      },
      {
        "text": "רווחים, הוצאות, מצב החברה והפוטנציאל העסקי",
        "nextStep": "svg_multi_select_example",
        "correct": true
      },
      {
        "text": "תבניות גרף, ממוצעים נעים ואינדיקטורים טכניים",
        "nextStep": "svg_multi_select_example",
        "correct": false
      },
      {
        "text": "הרגשה כללית של המשקיעים בשוק",
        "nextStep": "svg_multi_select_example",
        "correct": false
      }
    ]
  },
  {
    "id": "svg_multi_select_example",
    "message": "האם משקיעים יכולים להשתמש גם בניתוח טכני וגם בפונדמנטלי יחד?",
    "backgroundImage": "bg2",
    "activity": "svgMultiSelect",
    "activityConfig": {
      "svgOptions": [
        {
          "id": "opt_1",
          "label": "",
          "svgCode": "",
          "correct": true,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/a63ed68c-e770-4759-8b15-05cd371fe0ac",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762276195515_2q7w9g1p8w9.svg",
          "svgPath": "svg-multi-select/1762276195515_2q7w9g1p8w9.svg"
        },
        {
          "id": "opt_4",
          "label": "",
          "svgCode": "",
          "correct": false,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/c3435609-f47a-4e1a-a167-333d3ce6daea",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762276203660_3fymnqbzxj.svg",
          "svgPath": "svg-multi-select/1762276203660_3fymnqbzxj.svg"
        }
      ],
      "layout": "grid",
      "submitText": "בדוק",
      "correctExplanation": "מעולה! משקיע חכם יודע להשתמש בשתיהן בשביל לקבל תמונה מלאה.",
      "wrongExplanation": "שים לב! משקיע חכם יודע להשתמש בשתיהן בשביל לקבל תמונה מלאה.",
      "rewards": 10
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain3"
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
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/a486e4ad-8e09-4988-99c8-914ad0169490",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762086478940_phanyhk6t9o.png",
        "uploadedImagePath": "text-with-image/1762086478940_phanyhk6t9o.png"
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

