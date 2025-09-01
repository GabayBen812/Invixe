import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על נר השורי העוטף (Bullish Engulfing)! זהו אחד הדפוסים החזקים ביותר לזיהוי הפיכות שוריות.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_bullish_engulfing" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_bullish_engulfing",
    message: "נר שורי עוטף הוא דפוס של שני נרות: הראשון דובי (ירוק), השני שורי (אדום) שעוטף לחלוטין את הראשון.",
    backgroundImage: "bg2",
    visual: "bullishEngulfingCandle",
    choices: [
      { text: "המשך", nextStep: "bullish_engulfing_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bullish_engulfing_meaning",
    message: "הדפוס מצביע על כך שהשוריים לקחו שליטה מלאה. המחיר נפתח נמוך מהנר הקודם אבל סגר גבוה ממנו.",
    backgroundImage: "bg2",
    visual: "bullishEngulfingAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "bullish_engulfing_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "bullish_engulfing_signal",
    message: "זהו סימן הפיכה שורית חזק מאוד! השוריים הצליחו להפוך את המגמה ולקחת שליטה על השוק.",
    backgroundImage: "bg4",
    visual: "bullishEngulfingReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "bullish_engulfing_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "bullish_engulfing_location",
    message: "נר שורי עוטף הוא הכי חזק כשהוא מופיע אחרי ירידה ממושכת, בתמיכה חשובה, או עם נפח גבוה.",
    backgroundImage: "bg1",
    visual: "bullishEngulfingSupport",
    choices: [
      { text: "בואו נתאמן!", nextStep: "bullish_engulfing_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bullish_engulfing_practice",
    message: "סמן את כל הדפוסים שהם נרות שוריים עוטפים אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'bullishEngulfing', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "bullish_engulfing_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "bullish_engulfing_feedback",
    message: "מעולה! זיהית נכון את נרות השורי העוטף. זכור: נר דובי + נר שורי שעוטף אותו = הפיכה שורית חזקה.",
    backgroundImage: "bg4",
    visual: "bullishEngulfingSummary",
    choices: [
      { text: "סיכום", nextStep: "bullish_engulfing_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bullish_engulfing_summary",
    message: "סיכום נר שורי עוטף:\n• שני נרות: דובי + שורי\n• הנר השורי עוטף לחלוטין את הדובי\n• סימן הפיכה שורית חזק מאוד\n• הכי אפקטיבי אחרי ירידה\n• נפח גבוה מחזק את הסיגנל",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
