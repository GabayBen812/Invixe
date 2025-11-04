-- Upload new sublesson "אסטרטגיות מסחר" (Trading Strategies) to lesson 2 "סוגי נכסים"
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1 and the parent lesson ID for lesson 2
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
parent_lesson AS (
  SELECT id FROM "Lesson" WHERE code = 2 LIMIT 1
),

-- Insert or update sublesson "אסטרטגיות מסחר"
-- Using code 203 (for third sublesson of lesson 2)
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    203,
    'אסטרטגיות מסחר',
    'לימוד על דרכים שונות להשקיע בשוק ההון: השקעות לטווח ארוך, בינוני, סווינג טריידינג ומסחר תוך יומי',
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
    "message": "קיימות דרכים שונות להשקיע בשוק ההון. כל דרך מתאימה לאנשים שונים לפי הזמן, הסיכון והמטרה שלהם. בואו נבדוק!",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/5ee19bd7-e03c-49bc-bd34-7f3039a340f6",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761920779872_591zpf2vciy.png",
        "uploadedImagePath": "text-with-image/1761920779872_591zpf2vciy.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "simple_question2"
      }
    ]
  },
  {
    "id": "simple_question2",
    "message": "מה לדעתך האתגר הכי גדול של משקיע לטווח ארוך? ",
    "backgroundImage": "bg1",
    "characterImg": "character_orange_noback.png",
    "bubblePosition": "center",
    "activity": "simple_question",
    "activityConfig": {
      "correctExplanation": "מעולה!",
      "wrongExplanation": "שים לב! האתגר האמיתי הוא לא לגעת בהשקעה גם שיש ירידות ",
      "rewards": 5
    },
    "choices": [
      {
        "text": "לתזמן את השוק בצורה מושלמת",
        "nextStep": "simple_question3",
        "correct": false
      },
      {
        "text": "להישאר ממושמע גם בתקופות של ירידות",
        "nextStep": "simple_question3",
        "correct": true
      },
      {
        "text": "לבחון את תיק ההשקעות כל יום כדי לוודא שהוא מתקדם",
        "nextStep": "simple_question3",
        "correct": false
      },
      {
        "text": "להחליף השקעות בכל פעם שיוצאת הזדמנות חדשה",
        "nextStep": "simple_question3",
        "correct": false
      }
    ]
  },
  {
    "id": "simple_question3",
    "message": "מה האחוז תשואה הממוצע לדעתך שעושה משקיע לטווח ארוך?",
    "backgroundImage": "bg1",
    "characterImg": "character_orange_noback.png",
    "bubblePosition": "center",
    "activity": "simple_question",
    "activityConfig": {
      "correctExplanation": "אלוף!",
      "wrongExplanation": "כמעט! הממוצע השנתי עומד על כ6% - 10%",
      "rewards": 5
    },
    "choices": [
      {
        "text": "1% - 4%",
        "nextStep": "textWithImageExplain2",
        "correct": false
      },
      {
        "text": "מעל 20%",
        "nextStep": "textWithImageExplain2",
        "correct": true
      },
      {
        "text": "6%-10%",
        "nextStep": "textWithImageExplain2",
        "correct": true
      },
      {
        "text": "40%",
        "nextStep": "textWithImageExplain2",
        "correct": false
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
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/768f8d4e-1653-479d-9711-62d36d3a1261",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761919377827_fydv0c8lcs.png",
        "uploadedImagePath": "text-with-image/1761919377827_fydv0c8lcs.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "svg_multi_select_example2"
      }
    ]
  },
  {
    "id": "svg_multi_select_example2",
    "message": "מי לדעתך יצביע על פוטנציאל רווח גבוה יותר?",
    "backgroundImage": "bg2",
    "activity": "svgMultiSelect",
    "activityConfig": {
      "svgOptions": [
        {
          "id": "opt_3",
          "label": "",
          "svgCode": "",
          "correct": true,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/93a98255-9e2b-42b9-bc22-3286b1871579",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762275260906_j28cs59ythj.svg",
          "svgPath": "svg-multi-select/1762275260906_j28cs59ythj.svg"
        },
        {
          "id": "opt_4",
          "label": "",
          "svgCode": "",
          "correct": false,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/fcbc9c0e-e917-4d7a-b7ad-ce8b1aef6e74",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762275268652_kvkfprt75jp.svg",
          "svgPath": "svg-multi-select/1762275268652_kvkfprt75jp.svg"
        }
      ],
      "layout": "grid",
      "submitText": "בדוק",
      "correctExplanation": "מעולה! זיהית נכון את הנרות הנכונים. כל הנרות שבחרת הם אכן חלק מהתבנית הנכונה.",
      "wrongExplanation": "לא בדיוק. הנרות הנכונים הם אלה שמרכיבים את התבנית הנכונה. נסה שוב!",
      "rewards": 10
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "simple_question4"
      }
    ]
  },
  {
    "id": "simple_question4",
    "message": "מה היית מעריך שהחסרון של השקעות לטווח בינוני  מול טווח ארוך?",
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
        "text": "תשואות מובטחות וקבועות כל חודש",
        "nextStep": "textWithImageExplain5",
        "correct": true
      },
      {
        "text": "דורש יותר זמן ניהול ומעקב אחרי הגרף",
        "nextStep": "textWithImageExplain5",
        "correct": false
      },
      {
        "text": "אין כמעט סיכוי להרוויח יותר מהטווח הארוך",
        "nextStep": "textWithImageExplain5",
        "correct": false
      },
      {
        "text": "לא צריך בכלל ידע או ניסיון",
        "nextStep": "textWithImageExplain5",
        "correct": false
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
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/6ee95e10-6ac2-4cbb-8437-65ea5486e485",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761919653469_zisxznkb3bi.png",
        "uploadedImagePath": "text-with-image/1761919653469_zisxznkb3bi.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "svg_multi_select_example6"
      }
    ]
  },
  {
    "id": "svg_multi_select_example6",
    "message": "תבחר את מי שלדעתך  יצביע על פוטנציאל רווח גבוה יותר?",
    "backgroundImage": "bg2",
    "activity": "svgMultiSelect",
    "activityConfig": {
      "svgOptions": [
        {
          "id": "opt_3",
          "label": "",
          "svgCode": "",
          "correct": true,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/3b699a18-7169-4e89-97c2-ce8b7a96cbd6",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762275283681_s9tureawst.svg",
          "svgPath": "svg-multi-select/1762275283681_s9tureawst.svg"
        },
        {
          "id": "opt_4",
          "label": "",
          "svgCode": "",
          "correct": false,
          "svgUrl": "blob:https://invixe-lesson-builder.netlify.app/1ec33693-7638-490a-9e26-1aea46d3227e",
          "svgPublicUrl": "https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762275290303_fat1622xmjb.svg",
          "svgPath": "svg-multi-select/1762275290303_fat1622xmjb.svg"
        }
      ],
      "layout": "grid",
      "submitText": "בדוק",
      "correctExplanation": "",
      "wrongExplanation": "",
      "rewards": 10
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "simple_question5"
      }
    ]
  },
  {
    "id": "simple_question5",
    "message": "מה היית מעריך שהיתרון של סווינגים מול מסחר תוך יומי(דקות עד כמה שעות)?",
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
        "text": "פחות לחץ וניהול רגוע יותר – לא דורש מעקב יומיומי",
        "nextStep": "textWithImageExplain3",
        "correct": true
      },
      {
        "text": "צריך לשבת מול הגרפים כל היום כדי לא לפספס תנועה",
        "nextStep": "textWithImageExplain3",
        "correct": false
      },
      {
        "text": "אין צורך בכלל לבדוק מה קורה בשוק",
        "nextStep": "textWithImageExplain3",
        "correct": false
      },
      {
        "text": "מתאים בעיקר לקרנות גידור ולתאגידים גדולים",
        "nextStep": "textWithImageExplain3",
        "correct": false
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
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/69c94848-ce15-4976-9289-e62ce443ec0a",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761920624769_k5yrd6xeq4i.png",
        "uploadedImagePath": "text-with-image/1761920624769_k5yrd6xeq4i.png"
      }
    },
    "choices": [
      {
        "text": "המשך",
        "nextStep": "textWithImageExplain9"
      }
    ]
  },
  {
    "id": "textWithImageExplain9",
    "message": "האם הנר הזה הוא סימן חיובי לקניית המניה?",
    "backgroundImage": "bg2",
    "activity": "textWithImageExplain",
    "activityConfig": {
      "questionWithImage": {
        "imageSource": "chart_example",
        "submitText": "המשך",
        "correctExplanation": "מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
        "wrongExplanation": "לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
        "uploadedImageUrl": "blob:https://invixe-lesson-builder.netlify.app/9a367d3d-2141-4cca-993d-56505ec3fa51",
        "uploadedImage": null,
        "uploadedImagePublicUrl": "https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761920725279_nrbhx4o9ft.png",
        "uploadedImagePath": "text-with-image/1761920725279_nrbhx4o9ft.png"
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

