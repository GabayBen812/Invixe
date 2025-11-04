-- Upload new lesson (code 4) "נרות יפניים" and sublesson (code 401) "טיים פריים ונרות יפניים"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
-- Create or update main lesson (code 4)
main_lesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type)
  SELECT
    u.id,
    4,
    'נרות יפניים',
    'לימוד על נרות יפניים - כלי בסיסי בקריאת השוק וניתוח טכני',
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
-- Create or update sublesson (code 401) under lesson 4
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    401,
    'טיים פריים ונרות יפניים',
    'לימוד על נרות יפניים - כלי בסיסי בקריאת השוק, וכיצד כל נר מייצג פרק זמן מסוים (דקה, שעה, יום, שבוע)',
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
-- Insert or update lesson steps for the sublesson (code 401)
INSERT INTO "LessonStepsV2" (lessonid, steps)
SELECT
  s.id,
  $json$[
  {
    "id": "textWithImageExplain",
    "message": "אלה נרות יפניים — ככה סוחרים "קוראים" את השוק",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/d1cc6bd6-9596-4b23-a036-83b42d2629f1",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188301527_4hrb2mrsznt.png",
        "uploadedImagePath": "text-with-image/1762188301527_4hrb2mrsznt.png"
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
    "message": " נראה כמו סינית? זה דווקא יפנית!  אבל לא לדאוג,  תכף נדבר בשפה הזאת באופן שוטף ",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/471e712d-a1b9-4555-94e5-258f01614a70",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188379685_k72wwvs6wa.png",
        "uploadedImagePath": "text-with-image/1762188379685_k72wwvs6wa.png"
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
    "message": "כל נר מייצג פרק זמן מסוים – הוא יכול לתאר דקה, שעה, יום שלם ואפילו שבוע.  למרות שהנרות נראים דומים, הם יכולים לייצג תקופות זמן שונות לגמרי.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/8c7e7bb6-18f3-4c77-8152-a456ac779d6b",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188456718_mq2g8d6b2ei.png",
        "uploadedImagePath": "text-with-image/1762188456718_mq2g8d6b2ei.png"
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
    "message": "כמה נרות של דקה יהיו בנר אחד של שעה?",
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
        "text": "כ - 45 נרות",
        "nextStep": "simple_question1",
        "correct": false
      },
      {
        "text": "כ - 10 נרות",
        "nextStep": "simple_question1",
        "correct": true
      },
      {
        "text": "כ - 30 נרות",
        "nextStep": "simple_question1",
        "correct": false
      },
      {
        "text": "כ - 60 נרות",
        "nextStep": "simple_question1",
        "correct": true
      }
    ]
  },
  {
    "id": "simple_question1",
    "message": "כמה נרות של שעה יהיו בנר אחד של יום מסחר שלם?",
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
        "text": "כ- 12 נרות",
        "nextStep": "textWithImageExplain3",
        "correct": false
      },
      {
        "text": "כ - 24 נרות",
        "nextStep": "textWithImageExplain3",
        "correct": false
      },
      {
        "text": "כ - 9 נרות",
        "nextStep": "textWithImageExplain3",
        "correct": true
      },
      {
        "text": "כ - 10 נרות",
        "nextStep": "textWithImageExplain3",
        "correct": false
      }
    ]
  },
  {
    "id": "textWithImageExplain3",
    "message": "בוא נראה את זה בצורה ויזואלית  זה נר שמייצג יום מסחר שלם",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/be183919-cd27-4b2d-830d-58d45453a2be",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188737942_9pbr3qu78x5.png",
        "uploadedImagePath": "text-with-image/1762188737942_9pbr3qu78x5.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain4"
      }
    ]
  },
  {
    "id": "textWithImageExplain4",
    "message": "בתוך היום הזה נכנס לנרות שמייצגים שעה אחת",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/a6d00010-2722-4532-8613-ef78fb4887b7",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188777718_xokenh2skg.png",
        "uploadedImagePath": "text-with-image/1762188777718_xokenh2skg.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain5"
      }
    ]
  },
  {
    "id": "textWithImageExplain5",
    "message": "ככל שניכנס לזמן קצר יותר, נראה יותר פרטים – אבל זה גם יכול לבלבל. צריך לדעת באיזה מרחב זמן להשתמש בהתאם למטרה שלנו.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/5175a6f5-1454-44b2-8e0a-02bffd6a28aa",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188812749_1m7it8ntarm.png",
        "uploadedImagePath": "text-with-image/1762188812749_1m7it8ntarm.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain6"
      }
    ]
  },
  {
    "id": "textWithImageExplain6",
    "message": "",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/57c44143-79a7-42cc-9d9b-1e4c0f5d2d1c",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762188859822_7jhfssuhrmw.png",
        "uploadedImagePath": "text-with-image/1762188859822_7jhfssuhrmw.png"
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

