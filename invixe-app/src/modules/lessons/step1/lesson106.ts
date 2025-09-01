import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על נר הדובי הרמי (Bearish Harami)! זהו דפוס הפיכה עדין אך אמין.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_bearish_harami" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_bearish_harami",
    message: "נר דובי הרמי הוא דפוס של שני נרות: הראשון שורי גדול, השני דובי קטן שנמצא בתוך הגוף של הראשון.",
    backgroundImage: "bg2",
    visual: "bearishHaramiCandle",
    choices: [
      { text: "המשך", nextStep: "bearish_harami_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bearish_harami_meaning",
    message: "הדפוס מצביע על כך שהשוריים איבדו מומנטום. הדוביים הצליחו לעצור את העלייה ולהתחיל לרדת.",
    backgroundImage: "bg2",
    visual: "bearishHaramiAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "bearish_harami_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "bearish_harami_signal",
    message: "זהו סימן הפיכה דובית עדין אך אמין! הדוביים הצליחו לעצור את המגמה השורית ולהתחיל לרדת.",
    backgroundImage: "bg4",
    visual: "bearishHaramiReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "bearish_harami_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "bearish_harami_location",
    message: "נר דובי הרמי הוא הכי חזק כשהוא מופיע אחרי עלייה ממושכת, בהתנגדות חשובה, או עם נפח נמוך.",
    backgroundImage: "bg1",
    visual: "bearishHaramiResistance",
    choices: [
      { text: "בואו נתאמן!", nextStep: "bearish_harami_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bearish_harami_practice",
    message: "סמן את כל הדפוסים שהם נרות דוביים הרמי אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'bearishHarami', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "bearish_harami_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "bearish_harami_feedback",
    message: "מעולה! זיהית נכון את נרות הדובי הרמי. זכור: נר שורי גדול + נר דובי קטן בתוכו = הפיכה דובית עדינה.",
    backgroundImage: "bg4",
    visual: "bearishHaramiSummary",
    choices: [
      { text: "סיכום", nextStep: "bearish_harami_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bearish_harami_summary",
    message: "סיכום נר דובי הרמי:\n• שני נרות: שורי גדול + דובי קטן\n• הנר הדובי נמצא בתוך הגוף השורי\n• סימן הפיכה דובית עדין אך אמין\n• הכי אפקטיבי אחרי עלייה\n• נפח נמוך מחזק את הסיגנל",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
