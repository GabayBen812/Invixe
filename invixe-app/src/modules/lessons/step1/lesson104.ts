import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על נר הדובי העוטף (Bearish Engulfing)! זהו אחד הדפוסים החזקים ביותר לזיהוי הפיכות דוביות.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_bearish_engulfing" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_bearish_engulfing",
    message: "נר דובי עוטף הוא דפוס של שני נרות: הראשון שורי (אדום), השני דובי (ירוק) שעוטף לחלוטין את הראשון.",
    backgroundImage: "bg2",
    visual: "bearishEngulfingCandle",
    choices: [
      { text: "המשך", nextStep: "bearish_engulfing_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bearish_engulfing_meaning",
    message: "הדפוס מצביע על כך שהדוביים לקחו שליטה מלאה. המחיר נפתח גבוה מהנר הקודם אבל סגר נמוך ממנו.",
    backgroundImage: "bg2",
    visual: "bearishEngulfingAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "bearish_engulfing_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "bearish_engulfing_signal",
    message: "זהו סימן הפיכה דובית חזק מאוד! הדוביים הצליחו להפוך את המגמה ולקחת שליטה על השוק.",
    backgroundImage: "bg4",
    visual: "bearishEngulfingReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "bearish_engulfing_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "bearish_engulfing_location",
    message: "נר דובי עוטף הוא הכי חזק כשהוא מופיע אחרי עלייה ממושכת, בהתנגדות חשובה, או עם נפח גבוה.",
    backgroundImage: "bg1",
    visual: "bearishEngulfingResistance",
    choices: [
      { text: "בואו נתאמן!", nextStep: "bearish_engulfing_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bearish_engulfing_practice",
    message: "סמן את כל הדפוסים שהם נרות דוביים עוטפים אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'bearishEngulfing', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "bearish_engulfing_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "bearish_engulfing_feedback",
    message: "מעולה! זיהית נכון את נרות הדובי העוטף. זכור: נר שורי + נר דובי שעוטף אותו = הפיכה דובית חזקה.",
    backgroundImage: "bg4",
    visual: "bearishEngulfingSummary",
    choices: [
      { text: "סיכום", nextStep: "bearish_engulfing_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bearish_engulfing_summary",
    message: "סיכום נר דובי עוטף:\n• שני נרות: שורי + דובי\n• הנר הדובי עוטף לחלוטין את השורי\n• סימן הפיכה דובית חזק מאוד\n• הכי אפקטיבי אחרי עלייה\n• נפח גבוה מחזק את הסיגנל",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
