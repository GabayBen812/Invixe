-- Upload new sublesson "לונג ושורט" (Long and Short) to lesson 3 "מסחר בשוק ההון"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1 and the parent lesson ID for lesson 3
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 3 LIMIT 1
),

-- Insert or update sublesson "לונג ושורט"
-- Using code 304 (for fourth sublesson of lesson 3)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    304,
    'לונג ושורט',
    'לימוד על שתי אסטרטגיות מסחר: לונג - קנייה במחיר נמוך ומכירה במחיר גבוה, ושורט - מכירה במחיר גבוה וקנייה במחיר נמוך',
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
    "message": "אם אני מאמין שהמניה תעלה – אני קונה עכשיו, כדי למכור אחר כך במחיר גבוה יותר. הפעולה הזאת נקראת לונג. ",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/63b4f32d-bf61-49e4-a503-4d15389a31a7",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762163836905_933o7r7kfka.png",
        "uploadedImagePath": "text-with-image/1762163836905_933o7r7kfka.png"
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
    "message": " אבל האם אני יכול להרוויח כשאני חושב שמחיר מניה ירד?",
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
        "text": " רק אם החברה מחלקת דיבידנדים",
        "nextStep": "textWithImageExplain1",
        "correct": false
      },
      {
        "text": "רק אם המדינה מחליטה להדפיס עוד כסף",
        "nextStep": "textWithImageExplain1",
        "correct": false
      },
      {
        "text": "כן, זה נקרא "שורט" כאשר הרווח מגיע מירידת מחיר",
        "nextStep": "textWithImageExplain1",
        "correct": true
      },
      {
        "text": "לא, אפשר להרוויח רק כשהמניה עולה",
        "nextStep": "textWithImageExplain1",
        "correct": false
      }
    ]
  },
  {
    "id": "textWithImageExplain1",
    "message": "נניח שמניה שווה 100$. אני 'שואל' מניות מהברוקר דרכו אני סוחר ומוכר אותן מיד ב־100$. ",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/c2262da8-129c-4d31-b7cb-f949473a9b0c",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164112622_2d9yewpsbld.png",
        "uploadedImagePath": "text-with-image/1762164112622_2d9yewpsbld.png"
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
    "message": " שבוע אחרי זה, המחיר יורד ל־90$.  עכשיו אני קונה את אותה מניה מחדש  מחזיר אותה לברוקר,  ונשאר עם 10$ רווח.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/2e7ed081-30f6-4623-a0b3-dc987582aaf1",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164156237_ij91i6s6dap.png",
        "uploadedImagePath": "text-with-image/1762164156237_ij91i6s6dap.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain"
      }
    ]
  },
  {
    "id": "textWithImageExplain",
    "message": "",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/f2fdae93-70b6-4d43-acde-ede9b5d839ec",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164216244_8moua3o32wm.png",
        "uploadedImagePath": "text-with-image/1762164216244_8moua3o32wm.png"
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

