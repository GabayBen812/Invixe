-- Upload new sublesson "התנגדות ותקרה" (Support and Resistance) to lesson 3 "מסחר בשוק ההון"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1 and the parent lesson ID for lesson 3
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 3 LIMIT 1
),

-- Insert or update sublesson "התנגדות ותקרה"
-- Using code 305 (for fifth sublesson of lesson 3)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    305,
    'התנגדות ותקרה',
    'לימוד על תמיכה והתנגדות - כלים חשובים בניתוח טכני שמסמנים אזורים שבהם המחיר נוטה להיעצר או לשנות כיוון',
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
    "message": "תמיכה והתנגדות הם מהכלים החשובים בניתוח טכני.  הם מסמנים אזורים שבהם המחיר נוטה להיעצר או לשנות כיוון.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/237a56ee-4d8b-476a-b264-708236ff9469",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164498889_v3azzy13foc.png",
        "uploadedImagePath": "text-with-image/1762164498889_v3azzy13foc.png"
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
    "message": "כל פעם שמחיר לא מצליח לעבור רמה מסוימת — קוראים לזה התנגדות.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/1c4877e2-a8f5-4216-b9a8-af03637df57e",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164595881_xukm19tbel.png",
        "uploadedImagePath": "text-with-image/1762164595881_xukm19tbel.png"
      }
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
    "message": "כשזה קורה כמה פעמים באותו אזור, נוצרת תקרה.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/a6358685-1ef2-4b5c-bc23-acda0f760114",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164675324_d33qppcy57t.png",
        "uploadedImagePath": "text-with-image/1762164675324_d33qppcy57t.png"
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
    "message": "סימון התקרה בגרף עוזר לנו לצפות היכן המחיר עשוי להיעצר בפעם הבאה שיגיע לאזור.",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/012ea6e2-3775-42b9-88bf-dd3808b38527",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762164745705_mea5ekxon8n.png",
        "uploadedImagePath": "text-with-image/1762164745705_mea5ekxon8n.png"
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
    "message": "מה ההבדל בין התנגדות לתקרה?",
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
        "text": "התנגדות נוצרת רק בירידות ותקרה נוצרת רק בעליות.",
        "nextStep": "question_with_image",
        "correct": false
      },
      {
        "text": "התנגדות היא מחיר קבוע ותקרה היא מחיר שמשתנה כל יום.",
        "nextStep": "question_with_image",
        "correct": false
      },
      {
        "text": "התנגדות היא קו על הגרף ותקרה היא קו שנמצא תמיד מעל ההתנגדות.",
        "nextStep": "question_with_image",
        "correct": false
      },
      {
        "text": "התנגדות היא רמה שבה המחיר נעצר פעם אחת, ותקרה היא רמה שנבלמה לפחות פעמיים.",
        "nextStep": "question_with_image",
        "correct": true
      }
    ]
  },
  {
    "id": "question_with_image",
    "message": "מהו מחיר התקרה בגרף הזה?",
    "backgroundImage": "bg2",
    "activity": "questionWithImage",
    "activityConfig": {
      "questionWithImage": {
        "question": "האם הנר הזה הוא סימן חיובי לקניית המניה?",
        "imageSource": "chart_example",
        "choices": [
          {
            "id": "choice_2",
            "text": "10$",
            "correct": false
          },
          {
            "id": "choice_3",
            "text": "12$",
            "correct": true
          },
          {
            "id": "choice_4",
            "text": "6$",
            "correct": false
          }
        ],
        "submitText": "בדוק",
        "correctExplanation": "",
        "wrongExplanation": "",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/aac2686c-a6ca-4067-8863-b51975aeaab8",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/question-with-image/1762165724172_82zxyg5xmih.png",
        "uploadedImagePath": "question-with-image/1762165724172_82zxyg5xmih.png"
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
    "message": "",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/73766937-4fcf-40ee-9778-9804e1d07a42",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1762165894501_13ofbq3chcf.png",
        "uploadedImagePath": "text-with-image/1762165894501_13ofbq3chcf.png"
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

