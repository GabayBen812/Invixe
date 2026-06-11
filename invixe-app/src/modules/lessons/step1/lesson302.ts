import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "הנר הזה הוא:",
    backgroundImage: "bg1",
    choices: [
      { text: "נר דוג'י", nextStep: "doji_definition" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
    visual: "dojiIntro",
  },
  {
    id: "doji_definition",
    message: "נר דוג'י הוא נר עם גוף קטן וייתכן בכל צבע, ופתיל עליון ותחתון כמעט שווים בגודל או שווים. מראה על שוויון בין הקונים למוכרים",
    backgroundImage: "bg2",
    visual: "dojiDefinition",
    choices: [
      { text: "המשך", nextStep: "doji_characteristics" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "doji_characteristics",
    message: "פתיל כלפי מטה",
    backgroundImage: "bg2",
    visual: "dojiCharacteristics",
    choices: [
      { text: "גוף צר", nextStep: "doji_rule" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "doji_rule",
    message: "הפתיל צריך להיות ארוך פי 2 לפחות מגודל הגוף",
    backgroundImage: "bg4",
    visual: "dojiRule",
    choices: [
      { text: "מתי הוא מופיע?", nextStep: "doji_timing" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "doji_timing",
    message: "וגם כאשר הוא מופיע לאחר מגמת עלייה",
    backgroundImage: "bg1",
    visual: "dojiUptrend",
    choices: [
      { text: "מה הוא אומר?", nextStep: "doji_signal" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "doji_signal",
    message: "ומה הוא אומר? שעומד להיות שינוי מגמה כ 55%-52% מהמקרים.",
    backgroundImage: "bg4",
    visual: "dojiReversal",
    choices: [
      { text: "שינוי מגמה", nextStep: "doji_summary" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "doji_summary",
    message: "סיכום הנר: נר דוג'י - צבע הנר: שחור אדום!!! - מופיע מתי? אחרי מגמת עלייה/ירידה - שיעור היפוך ממוצע: 52%-55%",
    backgroundImage: "bg1",
    visual: "dojiSummary",
    choices: [
      {
        text: "שמור במילון",
        nextStep: "map",
        dictionaryTopicId: "candles",
        dictionaryTermId: "doji",
      },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
