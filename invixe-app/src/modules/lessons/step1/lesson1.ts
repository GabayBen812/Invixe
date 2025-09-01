import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  // Intro and basic concepts
  {
    id: "intro",
    message:
      "ברוכים הבאים לקורס ניתוח טכני — שיעור 1: נרות יפניים. נבין מהו נר, איך קוראים אותו, ונתאמן בזיהוי דפוסים בסיסיים.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_candle" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  // Removed generic candle intro to match Figma: we jump from hero to the selection activity
  {
    id: "activity_select_hammer",
    message: "סמן את כל הנרות שעומדות בעקרונות של פטיש",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'hammer', sampleSize: 4 },
    choices: [
      { text: "המשך", nextStep: "hammer_trend_question" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  // Hammer context question (after decline)
  {
    id: 'hammer_trend_question',
    message: 'האם הנר מצביע על שינוי מגמה לאחר ירידה לדעתך?',
    backgroundImage: 'bg2',
    visual: 'trendDownHammer',
    choices: [
      { text: 'כן', nextStep: 'hammer_trend_explain' },
      { text: 'לא', nextStep: 'wrong1', style: 'danger' },
    ],
    characterImg: 'character_blue_yellow.png',
    bubblePosition: 'topRight',
  },
  {
    id: 'hammer_trend_explain',
    message: 'מעולה! הוא מצביע שעשוי להיות שינוי מגמה לאחר ירידה – 60% מהפעמים.',
    backgroundImage: 'bg2',
    visual: 'vRecovery',
    choices: [
      { text: 'לסיכום', nextStep: 'hammer_summary' },
    ],
    characterImg: 'character_green_yellow.png',
    bubblePosition: 'topRight',
  },
  {
    id: 'hammer_summary',
    message: 'סיכום הנר: נר פטיש',
    backgroundImage: 'bg1',
    visual: 'summaryHammer',
    choices: [
      { text: 'שמור במילון', nextStep: 'map' },
    ],
    characterImg: 'character_green_yellow.png',
    bubblePosition: 'topRight',
    points: 10,
  },
];