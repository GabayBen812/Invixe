import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על נר כוכב נופל יום (Shooting Star Day)! זהו דפוס הפיכה דובית חזק.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_shooting_star_day" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_shooting_star_day",
    message: "נר כוכב נופל יום הוא נר עם גוף קטן וצל תחתון ארוך מאוד. הצל העליון קטן או לא קיים.",
    backgroundImage: "bg2",
    visual: "shootingStarDayCandle",
    choices: [
      { text: "המשך", nextStep: "shooting_star_day_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "shooting_star_day_meaning",
    message: "נר כוכב נופל יום מצביע על כך שהמחיר נפתח נמוך, עלה מאוד במהלך היום, אבל חזר כמעט לנקודת הפתיחה.",
    backgroundImage: "bg2",
    visual: "shootingStarDayAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "shooting_star_day_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "shooting_star_day_signal",
    message: "זהו סימן חזק לשינוי מגמה דובית! השוריים ניסו להעלות את המחיר אבל הדוביים הצליחו להוריד אותו בחזרה.",
    backgroundImage: "bg4",
    visual: "shootingStarDayReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "shooting_star_day_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "shooting_star_day_location",
    message: "נר כוכב נופל יום הוא הכי חזק כשהוא מופיע אחרי עלייה ממושכת או בהתנגדות חשובה. זה מצביע על הפיכה דובית.",
    backgroundImage: "bg1",
    visual: "shootingStarDayResistance",
    choices: [
      { text: "בואו נתאמן!", nextStep: "shooting_star_day_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "shooting_star_day_practice",
    message: "סמן את כל הנרות שהם נרות כוכב נופל יום אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'shootingStarDay', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "shooting_star_day_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "shooting_star_day_feedback",
    message: "מעולה! זיהית נכון את נרות כוכב נופל יום. זכור: גוף קטן + צל תחתון ארוך + צל עליון קטן = נר כוכב נופל יום.",
    backgroundImage: "bg4",
    visual: "shootingStarDaySummary",
    choices: [
      { text: "סיכום", nextStep: "shooting_star_day_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "shooting_star_day_summary",
    message: "סיכום נר כוכב נופל יום:\n• גוף קטן מאוד או לא קיים\n• צל תחתון ארוך מאוד\n• צל עליון קטן או לא קיים\n• סימן הפיכה דובית חזק\n• הכי אפקטיבי אחרי עלייה",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
