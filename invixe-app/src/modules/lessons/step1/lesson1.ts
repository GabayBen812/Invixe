import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message:
      "ברוכים הבאים לשיעור על נרות יפניים! נלמד מהו נר, איך לקרוא אותו, ומה המשמעות של סוגי נרות שונים.",
    backgroundImage: "bg1",
    choices: [
      {
        text: "בואו נתחיל!",
        nextStep: "what_is_candle",
      },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_candle",
    message:
      "נר יפני הוא דרך להציג את תנועת המחיר של מניה בפרק זמן מסוים. כל נר מראה את המחיר הפתיחה, הסגירה, הגבוה והנמוך.",
    backgroundImage: "bg2",
    choices: [
      {
        text: "הצג דוגמה לנר",
        nextStep: "candle_example",
      },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "candle_example",
    message: `דוגמה לנר:
מחיר פתיחה: 100
מחיר סגירה: 110
גבוה: 115
נמוך: 95
(🔲⬆️⬇️)
אם המחיר סגר גבוה מהפתיחה, הנר ירוק. אם סגר נמוך, הנר אדום.`,
    backgroundImage: "bg4",
    visual: "hammer",
    choices: [
      {
        text: "סוגי נרות נפוצים",
        nextStep: "bullish_candle",
      },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "bullish_candle",
    message:
      "נר שורי (Bullish):\nהמחיר סגר גבוה מהפתיחה. מסמן מגמת עלייה.\n(🟩)",
    backgroundImage: "bg2",
    visual: "bullish",
    choices: [
      {
        text: "המשך",
        nextStep: "bearish_candle",
      },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "bearish_candle",
    message:
      "נר דובי (Bearish):\nהמחיר סגר נמוך מהפתיחה. מסמן מגמת ירידה.\n(🟥)",
    backgroundImage: "bg2",
    visual: "bearish",
    choices: [
      {
        text: "המשך",
        nextStep: "doji_candle",
      },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "doji_candle",
    message:
      "נר דוג'י (Doji):\nמחיר הפתיחה והסגירה כמעט זהים. מסמן חוסר החלטיות בשוק.\n(➖)",
    backgroundImage: "bg2",
    visual: "doji",
    choices: [
      {
        text: "סיימתי את השיעור",
        nextStep: "map",
      },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomRight",
    points: 10,
  },
]; 