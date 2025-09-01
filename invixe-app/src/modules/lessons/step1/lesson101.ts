import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "הנר הזה הוא:",
    backgroundImage: "bg1",
    choices: [
      { text: "נר שפירית", nextStep: "dragonfly_definition" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
    visual: "dragonflyCandle",
  },
  {
    id: "dragonfly_definition",
    message: "נר שפירית הוא נר עם גוף קטן מאוד בחלק העליון ופתיל ארוך מתחת. [צבע הגוף פחות חשוב]",
    backgroundImage: "bg2",
    visual: "dragonflyCandle",
    choices: [
      { text: "המשך", nextStep: "dragonfly_characteristics" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "dragonfly_characteristics",
    message: "פתיל כלפי מטה",
    backgroundImage: "bg2",
    visual: "dragonflyCandle",
    choices: [
      { text: "גוף צר", nextStep: "dragonfly_rule" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "dragonfly_rule",
    message: "הפתיל צריך להיות ארוך פי 2 לפחות מגודל הגוף",
    backgroundImage: "bg4",
    visual: "dragonflyCandle",
    choices: [
      { text: "מתי הוא מופיע?", nextStep: "dragonfly_timing" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "dragonfly_timing",
    message: "נר שפירית משמעותי כשהוא מופיע אחרי מגמת ירידה",
    backgroundImage: "bg1",
    visual: "dragonflyTrend",
    choices: [
      { text: "מה הוא אומר?", nextStep: "dragonfly_signal" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "dragonfly_signal",
    message: "ומה הוא אומר? שעומד להיות שינוי מגמה ב-60-65% מהמקרים.",
    backgroundImage: "bg4",
    visual: "dragonflyReversal",
    choices: [
      { text: "שינוי מגמה", nextStep: "dragonfly_summary" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "dragonfly_summary",
    message: "סיכום הנר: נר שפירית - צבע הנר: שחור אדום!!! - מופיע מתי? אחרי מגמת ירידה - שיעור היפוך ממוצע: 60%-65%",
    backgroundImage: "bg1",
    visual: "dragonflyCandle",
    choices: [
      { text: "שמור במילון", nextStep: "map" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
]; 