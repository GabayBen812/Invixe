import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על נר כוכב נופל ערב (Shooting Star Evening)! זהו דפוס הפיכה דובית חזק.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_shooting_star_evening" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_shooting_star_evening",
    message: "נר כוכב נופל ערב הוא נר עם גוף קטן וצל תחתון ארוך מאוד. הצל העליון קטן או לא קיים.",
    backgroundImage: "bg2",
    visual: "shootingStarEveningCandle",
    choices: [
      { text: "המשך", nextStep: "shooting_star_evening_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "shooting_star_evening_meaning",
    message: "נר כוכב נופל ערב מצביע על כך שהמחיר נפתח נמוך, עלה מאוד במהלך היום, אבל חזר כמעט לנקודת הפתיחה.",
    backgroundImage: "bg2",
    visual: "shootingStarEveningAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "shooting_star_evening_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "shooting_star_evening_signal",
    message: "זהו סימן חזק לשינוי מגמה דובית! השוריים ניסו להעלות את המחיר אבל הדוביים הצליחו להוריד אותו בחזרה.",
    backgroundImage: "bg4",
    visual: "shootingStarEveningReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "shooting_star_evening_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "shooting_star_evening_location",
    message: "נר כוכב נופל ערב הוא הכי חזק כשהוא מופיע אחרי עלייה ממושכת או בהתנגדות חשובה. זה מצביע על הפיכה דובית.",
    backgroundImage: "bg1",
    visual: "shootingStarEveningResistance",
    choices: [
      { text: "בואו נתאמן!", nextStep: "shooting_star_evening_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "shooting_star_evening_practice",
    message: "סמן את כל הנרות שהם נרות כוכב נופל ערב אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'shootingStarEvening', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "shooting_star_evening_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "shooting_star_evening_feedback",
    message: "מעולה! זיהית נכון את נרות כוכב נופל ערב. זכור: גוף קטן + צל תחתון ארוך + צל עליון קטן = נר כוכב נופל ערב.",
    backgroundImage: "bg4",
    visual: "shootingStarEveningSummary",
    choices: [
      { text: "סיכום", nextStep: "shooting_star_evening_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "shooting_star_evening_summary",
    message: "סיכום נר כוכב נופל ערב:\n• גוף קטן מאוד או לא קיים\n• צל תחתון ארוך מאוד\n• צל עליון קטן או לא קיים\n• סימן הפיכה דובית חזק\n• הכי אפקטיבי אחרי עלייה",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
