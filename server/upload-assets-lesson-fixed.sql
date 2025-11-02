-- Upload new lesson (code 2) and sublesson (code 201) "סוגי נכסים" (Types of Assets)
-- Run this in Supabase SQL editor

-- First, get the unit ID for unit 1
WITH unit1 AS (
  SELECT id FROM "Unit" WHERE index = 1 LIMIT 1
),
-- Create or update main lesson (code 2)
main_lesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type)
  SELECT
    u.id,
    2,
    'סוגי נכסים',
    'מבוא לסוגים שונים של נכסים פיננסיים',
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
-- Create or update sublesson (code 201) under lesson 2
sublesson AS (
  INSERT INTO "Lesson" (unitid, code, title, description, type, parentlessonid)
  SELECT
    u.id,
    201,
    'סוגי נכסים',
    'לימוד על סוגים שונים של נכסים פיננסיים: אג"ח, סחורות, מט"ח, ומטבעות דיגיטליים',
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
-- Insert or update lesson steps for the sublesson (code 201)
INSERT INTO "LessonStepsV2" (lessonid, steps)
SELECT
  s.id,
  $json$[
    {
      "id":"textWithImageExplain",
      "message":"השיעור נבין מה זה כל סוג נכס מה היתרונות שלו ומה החסרונות שלו ",
      "backgroundImage":"bg2",
      "activity":"textWithImageExplain",
      "activityConfig":{
        "questionWithImage":{
          "imageSource":"chart_example",
          "submitText":"המשך",
          "correctExplanation":"מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
          "wrongExplanation":"לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
          "uploadedImageUrl":"blob:https://invixe-lesson-builder.netlify.app/a5f9336c-0600-4210-ae78-3ece4d257aad",
          "uploadedImage":null,
          "uploadedImagePublicUrl":"https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761857166511_4jggbe75npq.png",
          "uploadedImagePath":"text-with-image/1761857166511_4jggbe75npq.png"
        }
      },
      "choices":[{"text":"המשך","nextStep":"simple_question"}]
    },
    {
      "id":"simple_question",
      "message":"מה זה אגרות חוב?",
      "backgroundImage":"bg1",
      "characterImg":"character_orange_noback.png",
      "bubblePosition":"center",
      "activity":"simple_question",
      "activityConfig":{
        "correctExplanation":"",
        "wrongExplanation":"",
        "rewards":5
      },
      "choices":[
        {"text":"הלוואה שנותנים למדינה תמורת ריבית קבועה","nextStep":"textWithImageExplain2","correct":true},
        {"text":"כשהבורסה יוצרת מניות חדשות","nextStep":"textWithImageExplain2","correct":false},
        {"text":"כשמישהו קונה מניה ממישהו אחר","nextStep":"textWithImageExplain2","correct":false},
        {"text":"כשחברה מחלקת את עצמה לגיוס כסף","nextStep":"textWithImageExplain2","correct":false}
      ]
    },
    {
      "id":"textWithImageExplain2",
      "message":"",
      "backgroundImage":"bg2",
      "activity":"textWithImageExplain",
      "activityConfig":{
        "questionWithImage":{
          "imageSource":"chart_example",
          "submitText":"המשך",
          "correctExplanation":"מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
          "wrongExplanation":"לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
          "uploadedImageUrl":"blob:https://invixe-lesson-builder.netlify.app/0d00a162-72e7-4bad-840b-ca60a29e70a8",
          "uploadedImage":null,
          "uploadedImagePublicUrl":"https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761855310170_jpq42rbfhw.png",
          "uploadedImagePath":"text-with-image/1761855310170_jpq42rbfhw.png"
        }
      },
      "choices":[{"text":"המשך","nextStep":"svg_multi_select_example"}]
    },
    {
      "id":"svg_multi_select_example",
      "message":"גז, נפט, זהב וכסף נקראים סחורות ונסחרים בבורסה. איפה לדעתך יש פוטנציאל רווח גבוה יותר באג״ח או בסחורות?",
      "backgroundImage":"bg2",
      "activity":"svgMultiSelect",
      "activityConfig":{
        "svgMultiSelect":{
          "title":"בחר את הנרות הנכונים",
          "submitText":"בדוק",
          "layout":"grid",
          "rewards":10,
          "correctExplanation":"",
          "wrongExplanation":"",
          "options":[
            {
              "id":"opt_1",
              "label":"אג\"ח ממשלתי",
              "svgCode":"",
              "correct":false,
              "svgUrl":"blob:https://invixe-lesson-builder.netlify.app/b335ac2e-add6-41f3-b2ad-69e9c906c5a8",
              "svgPublicUrl":"https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762098073029_zpg9zjz7b8m.svg",
              "svgPath":"svg-multi-select/1762098073029_zpg9zjz7b8m.svg"
            },
            {
              "id":"opt_4",
              "label":"סחורות",
              "svgCode":"",
              "correct":true,
              "svgUrl":"blob:https://invixe-lesson-builder.netlify.app/ad3800a9-5aa6-4a77-b310-63d348c8f537",
              "svgPublicUrl":"https://mkdwubjposlywjiinwkn.supabase.co/storage/v1/object/public/lesson-images/svg-multi-select/1762098019645_rzkqr6r8hmk.svg",
              "svgPath":"svg-multi-select/1762098019645_rzkqr6r8hmk.svg"
            }
          ]
        }
      },
      "choices":[{"text":"המשך","nextStep":"1textWithImageExplain"}]
    },
    {
      "id":"1textWithImageExplain",
      "message":"",
      "backgroundImage":"bg2",
      "activity":"textWithImageExplain",
      "activityConfig":{
        "questionWithImage":{
          "imageSource":"chart_example",
          "submitText":"המשך",
          "correctExplanation":"מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
          "wrongExplanation":"לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
          "uploadedImageUrl":"blob:https://invixe-lesson-builder.netlify.app/fa89c7ba-c9da-4639-a3ee-7bcc8ed61692",
          "uploadedImage":null,
          "uploadedImagePublicUrl":"https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761856244183_rvsy5dubob9.png",
          "uploadedImagePath":"text-with-image/1761856244183_rvsy5dubob9.png"
        }
      },
      "choices":[{"text":"המשך","nextStep":"simple_question1"}]
    },
    {
      "id":"simple_question1",
      "message":"מה זה מט\"ח(מטבע חוץ)?",
      "backgroundImage":"bg1",
      "characterImg":"character_orange_noback.png",
      "bubblePosition":"center",
      "activity":"simple_question",
      "activityConfig":{
        "correctExplanation":"",
        "wrongExplanation":"",
        "rewards":5
      },
      "choices":[
        {"text":"מטבעות עתיקים שמוצאים באתרים ארכיאולוגיים","nextStep":"textWithImageExplain3","correct":false},
        {"text":"דולר, אירו, שקל ושאר מטבעות – מסחר במטבעות זרים בבורסה","nextStep":"textWithImageExplain3","correct":true},
        {"text":"השקעות בחברות טכנולוגיה שנסחרות בארה\"ב","nextStep":"textWithImageExplain3","correct":false},
        {"text":"נכסים כמו זהב ונפט – סחורות","nextStep":"textWithImageExplain3","correct":false}
      ]
    },
    {
      "id":"textWithImageExplain3",
      "message":"",
      "backgroundImage":"bg2",
      "activity":"textWithImageExplain",
      "activityConfig":{
        "questionWithImage":{
          "imageSource":"chart_example",
          "submitText":"המשך",
          "correctExplanation":"מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
          "wrongExplanation":"לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
          "uploadedImageUrl":"blob:https://invixe-lesson-builder.netlify.app/20ae37e7-f667-4e61-8e7c-14c278a449d1",
          "uploadedImage":null,
          "uploadedImagePublicUrl":"https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761856517362_dz5bwbpuz59.png",
          "uploadedImagePath":"text-with-image/1761856517362_dz5bwbpuz59.png"
        }
      },
      "choices":[{"text":"המשך","nextStep":"simple_question4"}]
    },
    {
      "id":"simple_question4",
      "message":"מה הם מטבעות דיגיטליים לדעתך?",
      "backgroundImage":"bg1",
      "characterImg":"character_orange_noback.png",
      "bubblePosition":"center",
      "activity":"simple_question",
      "activityConfig":{
        "correctExplanation":"",
        "wrongExplanation":"",
        "rewards":5
      },
      "choices":[
        {"text":"מטבעות קריפטוגרפיים שאינם מונפקים ע\"י בנק","nextStep":"textWithImageExplain5","correct":true},
        {"text":"מטבעות שבעזרתם אפשר לקנות מניות","nextStep":"textWithImageExplain5","correct":false},
        {"text":"העברת כספים בעזרת אפליקציה ","nextStep":"textWithImageExplain5","correct":false},
        {"text":"ביטקוין","nextStep":"textWithImageExplain5","correct":false}
      ]
    },
    {
      "id":"textWithImageExplain5",
      "message":"",
      "backgroundImage":"bg2",
      "activity":"textWithImageExplain",
      "activityConfig":{
        "questionWithImage":{
          "imageSource":"chart_example",
          "submitText":"המשך",
          "correctExplanation":"מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
          "wrongExplanation":"לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
          "uploadedImageUrl":"blob:https://invixe-lesson-builder.netlify.app/4e3c27a2-810a-4704-944c-a46420c5b77f",
          "uploadedImage":null,
          "uploadedImagePublicUrl":"https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761856851440_f37es3qw6dv.png",
          "uploadedImagePath":"text-with-image/1761856851440_f37es3qw6dv.png"
        }
      },
      "choices":[{"text":"המשך","nextStep":"textWithImageExplain7"}]
    },
    {
      "id":"textWithImageExplain7",
      "message":"",
      "backgroundImage":"bg2",
      "activity":"textWithImageExplain",
      "activityConfig":{
        "questionWithImage":{
          "imageSource":"chart_example",
          "submitText":"המשך",
          "correctExplanation":"מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.",
          "wrongExplanation":"לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!",
          "uploadedImageUrl":"blob:https://invixe-lesson-builder.netlify.app/5ad95862-be22-481b-9ec0-eb655b8ae564",
          "uploadedImage":null,
          "uploadedImagePublicUrl":"https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761857115357_n2c5gndg3s.png",
          "uploadedImagePath":"text-with-image/1761857115357_n2c5gndg3s.png"
        }
      },
      "choices":[{"text":"המשך","nextStep":""}]
    }
  ]$json$::jsonb
FROM sublesson s
ON CONFLICT (lessonid)
DO UPDATE SET
  steps = EXCLUDED.steps,
  updated_at = NOW();

