// Seed two units and two intro lessons, and load steps for lesson code 1
require('dotenv').config({ path: './server/.env' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, key);

  // Upsert Units
  const units = [
    { index: 1, title: 'welcome to the stock market', description: null },
    { index: 2, title: 'Technical anbhalysis', description: null },
  ];

  const { error: unitErr } = await sb.from('Unit').upsert(units, { onConflict: 'index' });
  if (unitErr) throw unitErr;

  // Fetch current units to get ids
  const { data: unitRows, error: unitSelErr } = await sb
    .from('Unit')
    .select('id, index');
  if (unitSelErr) throw unitSelErr;

  const unitByIndex = new Map(unitRows.map(u => [u.index, u.id]));

  // Upsert Lessons (code is the integer the app uses)
  const lessons = [
    { code: 1, unitid: unitByIndex.get(1), title: 'intro', description: null, type: 'info' },
    { code: 2, unitid: unitByIndex.get(2), title: 'intro', description: null, type: 'info' },
  ];

  const { error: lessonErr } = await sb.from('Lesson').upsert(lessons, { onConflict: 'code' });
  if (lessonErr) throw lessonErr;

  // Get lesson UUID for code 1
  const { data: lessonRows, error: lessonSelErr } = await sb
    .from('Lesson')
    .select('id, code')
    .in('code', [1, 2]);
  if (lessonSelErr) throw lessonSelErr;

  const lessonByCode = new Map(lessonRows.map(l => [l.code, l.id]));

  // Steps for lesson code 1
  const steps = [
    {
      id: 'textWithImageExplain',
      message: 'בשוק יש אנשים שמוכרים מוצרים\n ואנשים שקונים אותם.',
      backgroundImage: 'bg2',
      activity: 'textWithImageExplain',
      activityConfig: {
        questionWithImage: {
          imageSource: 'chart_example',
          submitText: 'המשך',
          correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.',
          wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!',
          uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/6a2ac5ed-5a1a-4c49-a661-ce76bed885f2',
          uploadedImage: null,
          uploadedImagePublicUrl:
            'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761735155165_8wdrnut7sug.png',
          uploadedImagePath: 'text-with-image/1761735155165_8wdrnut7sug.png',
        },
      },
      choices: [
        { text: 'המשך', nextStep: 'textWithImageExplain1' },
      ],
    },
    {
      id: 'textWithImageExplain1',
      message: 'גם הבורסה עובדת ככה בדיוק. \n יש אנשים שקונים מניות,\n ואנשים שמוכרים מניות.',
      backgroundImage: 'bg2',
      activity: 'textWithImageExplain',
      activityConfig: {
        questionWithImage: {
          imageSource: 'chart_example',
          submitText: 'המשך',
          correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.',
          wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!',
          uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/89e81482-3b4d-4e1e-a762-7691525c18fb',
          uploadedImage: null,
          uploadedImagePublicUrl:
            'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761735492558_5z9izvrt2gu.png',
          uploadedImagePath: 'text-with-image/1761735492558_5z9izvrt2gu.png',
        },
      },
      choices: [
        { text: 'המשך', nextStep: 'simple_question' },
      ],
    },
    {
      id: 'simple_question',
      message: 'איך היית מנחש שנוצרות מניות? ',
      backgroundImage: 'bg1',
      characterImg: 'character_orange_noback.png',
      bubblePosition: 'center',
      activity: 'simple_question',
      activityConfig: {
        correctExplanation:
          'מעולה! כשחברה רוצה כסף, היא מוכרת חלקים קטנים ממנה לציבור, ואלו נקראים מניות.',
        wrongExplanation:
          'שים לב! כשחברה רוצה כסף, היא מוכרת חלקים קטנים ממנה לציבור  החלקים האלה נקראים מניות.',
        rewards: 10,
      },
      choices: [
        { text: 'כשפותחים חשבון השקעות בבנק', nextStep: 'simple_question1', correct: false },
        { text: 'כשהבורסה יוצרת מניות חדשות', nextStep: 'simple_question1', correct: false },
        { text: 'כשמישהו קונה מניה ממישהו אחר', nextStep: 'simple_question1', correct: false },
        { text: 'כשחברה מחלקת את עצמה כדי לגייס כסף', nextStep: 'simple_question1', correct: true },
      ],
    },
    {
      id: 'simple_question1',
      message: 'מה זה לדעתך ניתוח טכני?',
      backgroundImage: 'bg1',
      characterImg: 'character_orange_noback.png',
      bubblePosition: 'center',
      activity: 'simple_question',
      activityConfig: {
        correctExplanation: 'נהדר! כשיש לך מניות בחברה אתה בעצם הבעלים של חלק קטן ממנה ',
        wrongExplanation: 'שים לב, כשיש לך מניות בחברה יש לך חלקים קטנים מבעלות החברה ',
        rewards: 10,
      },
      choices: [
        { text: 'חלק קטן מבעלות החברה', nextStep: 'textWithImageExplain2', correct: true },
        { text: 'חוזה בין המשקיע לחברה שמבטיח רווח קבוע ', nextStep: 'textWithImageExplain2', correct: false },
        { text: 'נייר שמבטיח שהחברה תחזיר את כל ההשקעה תוך שנה', nextStep: 'textWithImageExplain2', correct: false },
        { text: 'כרטיס גישה מיוחד למשקיעים של החברה', nextStep: 'textWithImageExplain2', correct: false },
      ],
    },
    {
      id: 'textWithImageExplain2',
      message:
        'כשחברה מצליחה, ערך המניה שלה עולה - וכל בעלי המניות מרוויחים יחד איתה.',
      backgroundImage: 'bg2',
      activity: 'textWithImageExplain',
      activityConfig: {
        questionWithImage: {
          imageSource: 'chart_example',
          submitText: 'המשך',
          correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.',
          wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!',
          uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/b990cac0-24c6-4fdd-9c4a-1c8c8e985028',
          uploadedImage: null,
          uploadedImagePublicUrl:
            'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761736129223_jyu19c7bwr.png',
          uploadedImagePath: 'text-with-image/1761736129223_jyu19c7bwr.png',
        },
      },
      choices: [
        { text: 'המשך', nextStep: 'textWithImageExplain4' },
      ],
    },
    {
      id: 'textWithImageExplain4',
      message:
        'וכשחברה נכשלת, ערך המניה שלה יורד - וכל בעלי המניות מפסידים יחד איתה.',
      backgroundImage: 'bg2',
      activity: 'textWithImageExplain',
      activityConfig: {
        questionWithImage: {
          imageSource: 'chart_example',
          submitText: 'המשך',
          correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.',
          wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!',
          uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/39e3a75b-f63d-47d2-811c-58cf5336c41e',
          uploadedImage: null,
          uploadedImagePublicUrl:
            'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761736209777_m5yl8xgfwbe.png',
          uploadedImagePath: 'text-with-image/1761736209777_m5yl8xgfwbe.png',
        },
      },
      choices: [
        { text: 'המשך', nextStep: 'svg_multi_select_example' },
      ],
    },
    {
      id: 'svg_multi_select_example',
      message: 'בוא ניתן דוגמה...  בחר חברה!',
      backgroundImage: 'bg2',
      activity: 'svgMultiSelect',
      activityConfig: {
        svgMultiSelect: {
          title: 'בחר את הנרות הנכונים',
          submitText: 'בדוק',
          layout: 'grid',
          rewards: 10,
          correctExplanation:
            'מעולה! זיהית נכון את הנרות הנכונים. כל הנרות שבחרת הם אכן חלק מהתבנית הנכונה.',
          wrongExplanation:
            'לא בדיוק. הנרות הנכונים הם אלה שמרכיבים את התבנית הנכונה. נסה שוב!',
          options: [
            {
              id: 'opt_1',
              label: 'מייקרוספוט',
              svgCode: `
<svg width="92" height="157" viewBox="0 0 92 157" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_2179_19219)">
<mask id="path-1-outside-1_2179_19219" maskUnits="userSpaceOnUse" x="18.6992" y="13.701" width="54" height="120" fill="black">
<rect fill="white" x="18.6992" y="13.701" width="54" height="120"/>
<path d="M46.8496 18.7C48.2302 18.7 49.3493 19.8195 49.3496 21.2V55.7H62.6992C66.0129 55.7 68.6992 58.3863 68.6992 61.7V83.7C68.6992 87.0137 66.0129 89.7 62.6992 89.7H49.3496V127.201C49.3493 128.581 48.2302 129.701 46.8496 129.701C45.4691 129.701 44.3499 128.581 44.3496 127.201V89.7H28.6992C25.3855 89.7 22.6992 87.0137 22.6992 83.7V61.7C22.6992 58.3863 25.3855 55.7 28.6992 55.7H44.3496V21.2C44.3499 19.8195 45.4691 18.7 46.8496 18.7Z"/>
</mask>
<path d="M46.8496 18.7C48.2302 18.7 49.3493 19.8195 49.3496 21.2V55.7H62.6992C66.0129 55.7 68.6992 58.3863 68.6992 61.7V83.7C68.6992 87.0137 66.0129 89.7 62.6992 89.7H49.3496V127.201C49.3493 128.581 48.2302 129.701 46.8496 129.701C45.4691 129.701 44.3499 128.581 44.3496 127.201V89.7H28.6992C25.3855 89.7 22.6992 87.0137 22.6992 83.7V61.7C22.6992 58.3863 25.3855 55.7 28.6992 55.7H44.3496V21.2C44.3499 19.8195 45.4691 18.7 46.8496 18.7Z" fill="#62D24C"/>
<path d="M49.3496 21.2H53.3496V21.1992L49.3496 21.2ZM49.3496 55.7H45.3496V59.7H49.3496V55.7ZM68.6992 83.7H72.6992H68.6992ZM62.6992 89.7V93.7V89.7ZM49.3496 89.7V85.7H45.3496V89.7H49.3496ZM49.3496 127.201L53.3496 127.202V127.201H49.3496ZM44.3496 127.201H40.3496V127.202L44.3496 127.201ZM44.3496 89.7H48.3496V85.7H44.3496V89.7ZM22.6992 61.7H18.6992H22.6992ZM28.6992 55.7V51.7H28.6992L28.6992 55.7ZM44.3496 55.7V59.7H48.3496V55.7H44.3496ZM44.3496 21.2L40.3496 21.1992V21.2H44.3496ZM46.8496 18.7V22.7C46.0203 22.7 45.3498 22.0281 45.3496 21.2008L49.3496 21.2L53.3496 21.1992C53.3489 17.611 50.4401 14.7 46.8496 14.7V18.7ZM49.3496 21.2H45.3496V55.7H49.3496H53.3496V21.2H49.3496ZM49.3496 55.7V59.7H62.6992V55.7V51.7H49.3496V55.7ZM62.6992 55.7V59.7C63.8038 59.7 64.6992 60.5954 64.6992 61.7H68.6992H72.6992C72.6992 56.1772 68.2221 51.7 62.6992 51.7V55.7ZM68.6992 61.7H64.6992V83.7H68.6992H72.6992V61.7H68.6992ZM68.6992 83.7H64.6992C64.6992 84.8046 63.8038 85.7 62.6992 85.7V89.7V93.7C68.2221 93.7 72.6992 89.2229 72.6992 83.7H68.6992ZM62.6992 89.7V85.7H49.3496V89.7V93.7H62.6992V89.7ZM49.3496 89.7H45.3496V127.201H49.3496H53.3496V89.7H49.3496ZM49.3496 127.201L45.3496 127.2C45.3498 126.373 46.0203 125.701 46.8496 125.701V129.701V133.701C50.4401 133.701 53.3489 130.79 53.3496 127.202L49.3496 127.201ZM46.8496 129.701V125.701C47.679 125.701 48.3495 126.373 48.3496 127.2L44.3496 127.201L40.3496 127.202C40.3503 130.79 43.2592 133.701 46.8496 133.701V129.701ZM44.3496 127.201H48.3496V89.7H44.3496H40.3496V127.201H44.3496ZM44.3496 89.7V85.7H28.6992V89.7V93.7H44.3496V89.7ZM28.6992 89.7V85.7C27.5946 85.7 26.6992 84.8046 26.6992 83.7H22.6992H18.6992C18.6992 89.2229 23.1764 93.7 28.6992 93.7V89.7ZM22.6992 83.7H26.6992V61.7H22.6992H18.6992V83.7H22.6992ZM22.6992 61.7H26.6992C26.6992 60.5954 27.5946 59.7 28.6992 59.7L28.6992 55.7L28.6992 51.7C23.1764 51.7 18.6992 56.1772 18.6992 61.7H22.6992ZM28.6992 55.7V59.7H44.3496V55.7V51.7H28.6992V55.7ZM44.3496 55.7H48.3496V21.2H44.3496H40.3496V55.7H44.3496ZM44.3496 21.2L48.3496 21.2008C48.3495 22.0281 47.679 22.7 46.8496 22.7V18.7V14.7C43.2592 14.7 40.3503 17.611 40.3496 21.1992L44.3496 21.2Z" fill="white" mask="url(#path-1-outside-1_2179_19219)"/>
</g>
<defs>
<filter id="filter0_d_2179_19219" x="-0.000782013" y="1.14441e-05" width="91.4" height="156.401" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="9.35"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2179_19219"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2179_19219" result="shape"/>
</filter>
</defs>
</svg>
`,
              correct: true,
            },
          ],
        },
      },
      choices: [
        { text: 'המשך', nextStep: 'textWithImageExplain6' },
      ],
    },
    {
      id: 'textWithImageExplain6',
      message: '',
      backgroundImage: 'bg2',
      activity: 'textWithImageExplain',
      activityConfig: {
        questionWithImage: {
          imageSource: 'chart_example',
          submitText: 'המשך',
          correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.',
          wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!',
          uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/f609228b-80a5-471f-9119-3c2c61dc1359',
          uploadedImage: null,
          uploadedImagePublicUrl:
            'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761737083930_s8m36k5bbc.png',
          uploadedImagePath: 'text-with-image/1761737083930_s8m36k5bbc.png',
        },
      },
      choices: [
        { text: 'המשך', nextStep: 'textWithImageExplain7' },
      ],
    },
    {
      id: 'textWithImageExplain7',
      message: '',
      backgroundImage: 'bg2',
      activity: 'textWithImageExplain',
      activityConfig: {
        questionWithImage: {
          imageSource: 'chart_example',
          submitText: 'המשך',
          correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.',
          wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!',
          uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/ffa7dc90-952c-46b6-8edf-889bd8710f28',
          uploadedImage: null,
          uploadedImagePublicUrl:
            'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761737522459_a4plbx69oqj.png',
          uploadedImagePath: 'text-with-image/1761737522459_a4plbx69oqj.png',
        },
      },
      choices: [
        { text: 'המשך', nextStep: '' },
      ],
    },
  ];

  const lessonId = lessonByCode.get(1);
  if (!lessonId) throw new Error('Lesson with code 1 not found');

  // Upsert steps
  const { error: stepsErr } = await sb.from('LessonStepsV2').upsert(
    [{ lessonid: lessonId, steps }],
    { onConflict: 'lessonid' }
  );
  if (stepsErr) throw stepsErr;

  console.log('Seeding completed successfully');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


