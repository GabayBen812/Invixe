// Seed single unit/lesson/sublesson and attach provided steps
require('dotenv').config({ path: './server/.env' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  const sb = createClient(url, key);

  // Clean all other data except what we will upsert
  // 1) Ensure unit index=1
  const { data: unitRow, error: uErr } = await sb
    .from('Unit')
    .upsert({ index: 1, title: 'welcome to the stock market' }, { onConflict: 'index' })
    .select('id')
    .maybeSingle();
  if (uErr) throw uErr;
  const unitId = unitRow?.id;

  // 2) Upsert parent lesson code=1
  const { data: parentLesson, error: pErr } = await sb
    .from('Lesson')
    .upsert({ code: 1, unitid: unitId, title: 'intro', description: '', type: 'info' }, { onConflict: 'code' })
    .select('id, code')
    .maybeSingle();
  if (pErr) throw pErr;

  // 3) Upsert sublesson code=101 linked to parent
  const { data: subLesson, error: sErr } = await sb
    .from('Lesson')
    .upsert({ code: 101, unitid: unitId, title: 'intro sublesson', description: 'first steps', type: 'info', parentlessonid: parentLesson.id }, { onConflict: 'code' })
    .select('id, code')
    .maybeSingle();
  if (sErr) throw sErr;

  // 4) Delete all other lessons/units (keep only index=1, codes 1 and 101)
  const { data: otherLessons } = await sb
    .from('Lesson')
    .select('id, code')
    .not('code', 'in', '(1,101)');
  if (otherLessons && otherLessons.length > 0) {
    const otherIds = otherLessons.map(l => l.id);
    await sb.from('LessonStepsV2').delete().in('lessonid', otherIds);
    await sb.from('Lesson').delete().in('id', otherIds);
  }
  const { data: otherUnits } = await sb
    .from('Unit')
    .select('id, index')
    .not('index', 'eq', 1);
  if (otherUnits && otherUnits.length > 0) {
    const unitIds = otherUnits.map(u => u.id);
    await sb.from('Unit').delete().in('id', unitIds);
  }

  // 5) Attach provided steps to sublesson (code=101)
  const steps = [
    { id: 'textWithImageExplain', message: 'בשוק יש אנשים שמוכרים מוצרים\n ואנשים שקונים אותם.', backgroundImage: 'bg2', activity: 'textWithImageExplain', activityConfig: { questionWithImage: { imageSource: 'chart_example', submitText: 'המשך', correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.', wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!', uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/6a2ac5ed-5a1a-4c49-a661-ce76bed885f2', uploadedImage: null, uploadedImagePublicUrl: 'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761735155165_8wdrnut7sug.png', uploadedImagePath: 'text-with-image/1761735155165_8wdrnut7sug.png' } }, choices: [ { text: 'המשך', nextStep: 'textWithImageExplain1' } ] },
    { id: 'textWithImageExplain1', message: 'גם הבורסה עובדת ככה בדיוק. \n יש אנשים שקונים מניות,\n ואנשים שמוכרים מניות.', backgroundImage: 'bg2', activity: 'textWithImageExplain', activityConfig: { questionWithImage: { imageSource: 'chart_example', submitText: 'המשך', correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.', wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!', uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/89e81482-3b4d-4e1e-a762-7691525c18fb', uploadedImage: null, uploadedImagePublicUrl: 'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761735492558_5z9izvrt2gu.png', uploadedImagePath: 'text-with-image/1761735492558_5z9izvrt2gu.png' } }, choices: [ { text: 'המשך', nextStep: 'simple_question' } ] },
    { id: 'simple_question', message: 'איך היית מנחש שנוצרות מניות? ', backgroundImage: 'bg1', characterImg: 'character_orange_noback.png', bubblePosition: 'center', activity: 'simple_question', activityConfig: { correctExplanation: 'מעולה! כשחברה רוצה כסף, היא מוכרת חלקים קטנים ממנה לציבור, ואלו נקראים מניות.', wrongExplanation: 'שים לב! כשחברה רוצה כסף, היא מוכרת חלקים קטנים ממנה לציבור  החלקים האלה נקראים מניות.', rewards: 10 }, choices: [ { text: 'כשפותחים חשבון השקעות בבנק', nextStep: 'simple_question1', correct: false }, { text: 'כשהבורסה יוצרת מניות חדשות', nextStep: 'simple_question1', correct: false }, { text: 'כשמישהו קונה מניה ממישהו אחר', nextStep: 'simple_question1', correct: false }, { text: 'כשחברה מחלקת את עצמה כדי לגייס כסף', nextStep: 'simple_question1', correct: true } ] },
    { id: 'simple_question1', message: 'מה זה לדעתך ניתוח טכני?', backgroundImage: 'bg1', characterImg: 'character_orange_noback.png', bubblePosition: 'center', activity: 'simple_question', activityConfig: { correctExplanation: 'נהדר! כשיש לך מניות בחברה אתה בעצם הבעלים של חלק קטן ממנה ', wrongExplanation: 'שים לב, כשיש לך מניות בחברה יש לך חלקים קטנים מבעלות החברה ', rewards: 10 }, choices: [ { text: 'חלק קטן מבעלות החברה', nextStep: 'textWithImageExplain2', correct: true }, { text: 'חוזה בין המשקיע לחברה שמבטיח רווח קבוע ', nextStep: 'textWithImageExplain2', correct: false }, { text: 'נייר שמבטיח שהחברה תחזיר את כל ההשקעה תוך שנה', nextStep: 'textWithImageExplain2', correct: false }, { text: 'כרטיס גישה מיוחד למשקיעים של החברה', nextStep: 'textWithImageExplain2', correct: false } ] },
    { id: 'textWithImageExplain2', message: 'כשחברה מצליחה, ערך המניה שלה עולה - וכל בעלי המניות מרוויחים יחד איתה.', backgroundImage: 'bg2', activity: 'textWithImageExplain', activityConfig: { questionWithImage: { imageSource: 'chart_example', submitText: 'המשך', correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.', wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!', uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/b990cac0-24c6-4fdd-9c4a-1c8c8e985028', uploadedImage: null, uploadedImagePublicUrl: 'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761736129223_jyu19c7bwr.png', uploadedImagePath: 'text-with-image/1761736129223_jyu19c7bwr.png' } }, choices: [ { text: 'המשך', nextStep: 'textWithImageExplain4' } ] },
    { id: 'textWithImageExplain4', message: 'וכשחברה נכשלת, ערך המניה שלה יורד - וכל בעלי המניות מפסידים יחד איתה.', backgroundImage: 'bg2', activity: 'textWithImageExplain', activityConfig: { questionWithImage: { imageSource: 'chart_example', submitText: 'המשך', correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.', wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!', uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/39e3a75b-f63d-47d2-811c-58cf5336c41e', uploadedImage: null, uploadedImagePublicUrl: 'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761736209777_m5yl8xgfwbe.png', uploadedImagePath: 'text-with-image/1761736209777_m5yl8xgfwbe.png' } }, choices: [ { text: 'המשך', nextStep: 'svg_multi_select_example' } ] },
    { id: 'svg_multi_select_example', message: 'בוא ניתן דוגמה...  בחר חברה!', backgroundImage: 'bg2', activity: 'svgMultiSelect', activityConfig: { svgMultiSelect: { title: 'בחר את הנרות הנכונים', submitText: 'בדוק', layout: 'grid', rewards: 10, correctExplanation: 'מעולה! זיהית נכון את הנרות הנכונים. כל הנרות שבחרת הם אכן חלק מהתבנית הנכונה.', wrongExplanation: 'לא בדיוק. הנרות הנכונים הם אלה שמרכיבים את התבנית הנכונה. נסה שוב!', options: [ { id: 'opt_1', label: 'מייקרוספוט', svgCode: '<svg width="92" height="157" viewBox="0 0 92 157" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_d_2179_19219)"><mask id="path-1-outside-1_2179_19219" maskUnits="userSpaceOnUse" x="18.6992" y="13.701" width="54" height="120" fill="black"><rect fill="white" x="18.6992" y="13.701" width="54" height="120"/><path d="M46.8496 18.7C48.2302 18.7 49.3493 19.8195 49.3496 21.2V55.7H62.6992C66.0129 55.7 68.6992 58.3863 68.6992 61.7V83.7C68.6992 87.0137 66.0129 89.7 62.6992 89.7H49.3496V127.201C49.3493 128.581 48.2302 129.701 46.8496 129.701C45.4691 129.701 44.3499 128.581 44.3496 127.201V89.7H28.6992C25.3855 89.7 22.6992 87.0137 22.6992 83.7V61.7C22.6992 58.3863 25.3855 55.7 28.6992 55.7H44.3496V21.2C44.3499 19.8195 45.4691 18.7 46.8496 18.7Z"/></mask><path d="M46.8496 18.7C48.2302 18.7 49.3493 19.8195 49.3496 21.2V55.7H62.6992C66.0129 55.7 68.6992 58.3863 68.6992 61.7V83.7C68.6992 87.0137 66.0129 89.7 62.6992 89.7H49.3496V127.201C49.3493 128.581 48.2302 129.701 46.8496 129.701C45.4691 129.701 44.3499 128.581 44.3496 127.201V89.7H28.6992C25.3855 89.7 22.6992 87.0137 22.6992 83.7V61.7C22.6992 58.3863 25.3855 55.7 28.6992 55.7H44.3496V21.2C44.3499 19.8195 45.4691 18.7 46.8496 18.7Z" fill="#62D24C"/></g></svg>', correct: true } ] } }, choices: [ { text: 'המשך', nextStep: 'textWithImageExplain6' } ] },
    { id: 'textWithImageExplain6', message: '', backgroundImage: 'bg2', activity: 'textWithImageExplain', activityConfig: { questionWithImage: { imageSource: 'chart_example', submitText: 'המשך', correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.', wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!', uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/f609228b-80a5-471f-9119-3c2c61dc1359', uploadedImage: null, uploadedImagePublicUrl: 'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761737083930_s8m36k5bbc.png', uploadedImagePath: 'text-with-image/1761737083930_s8m36k5bbc.png' } }, choices: [ { text: 'המשך', nextStep: 'textWithImageExplain7' } ] },
    { id: 'textWithImageExplain7', message: '', backgroundImage: 'bg2', activity: 'textWithImageExplain', activityConfig: { questionWithImage: { imageSource: 'chart_example', submitText: 'המשך', correctExplanation: 'מעולה! זיהית נכון שזהו נר פטיש שמסמן סימן חיובי לקנייה.', wrongExplanation: 'לא בדיוק. זהו נר פטיש שמסמן סימן חיובי לקנייה. נסה שוב!', uploadedImageUrl: 'blob:https://invixe-lesson-builder.netlify.app/ffa7dc90-952c-46b6-8edf-889bd8710f28', uploadedImage: null, uploadedImagePublicUrl: 'https://msmkiolnyhtnvjabfinh.supabase.co/storage/v1/object/public/lesson-images/text-with-image/1761737522459_a4plbx69oqj.png', uploadedImagePath: 'text-with-image/1761737522459_a4plbx69oqj.png' } }, choices: [ { text: 'המשך', nextStep: '' } ] },
  ];

  // attach steps
  const { error: upErr } = await sb
    .from('LessonStepsV2')
    .upsert({ lessonid: subLesson.id, steps }, { onConflict: 'lessonid' });
  if (upErr) throw upErr;

  console.log('Seeded single lesson structure successfully');
}

run().catch(e => { console.error(e); process.exit(1); });


