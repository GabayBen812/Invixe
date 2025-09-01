import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על נר השורי הרמי (Bullish Harami)! זהו דפוס הפיכה עדין אך אמין.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_bullish_harami" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_bullish_harami",
    message: "נר שורי הרמי הוא דפוס של שני נרות: הראשון דובי גדול, השני שורי קטן שנמצא בתוך הגוף של הראשון.",
    backgroundImage: "bg2",
    visual: "bullishHaramiCandle",
    choices: [
      { text: "המשך", nextStep: "bullish_harami_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bullish_harami_meaning",
    message: "הדפוס מצביע על כך שהדוביים איבדו מומנטום. השוריים הצליחו לעצור את הירידה ולהתחיל להתאושש.",
    backgroundImage: "bg2",
    visual: "bullishHaramiAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "bullish_harami_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "bullish_harami_signal",
    message: "זהו סימן הפיכה שורית עדין אך אמין! השוריים הצליחו לעצור את המגמה הדובית ולהתחיל להתאושש.",
    backgroundImage: "bg4",
    visual: "bullishHaramiReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "bullish_harami_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "bullish_harami_location",
    message: "נר שורי הרמי הוא הכי חזק כשהוא מופיע אחרי ירידה ממושכת, בתמיכה חשובה, או עם נפח נמוך.",
    backgroundImage: "bg1",
    visual: "bullishHaramiSupport",
    choices: [
      { text: "בואו נתאמן!", nextStep: "bullish_harami_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bullish_harami_practice",
    message: "סמן את כל הדפוסים שהם נרות שוריים הרמי אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'bullishHarami', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "bullish_harami_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "bullish_harami_feedback",
    message: "מעולה! זיהית נכון את נרות השורי הרמי. זכור: נר דובי גדול + נר שורי קטן בתוכו = הפיכה שורית עדינה.",
    backgroundImage: "bg4",
    visual: "bullishHaramiSummary",
    choices: [
      { text: "סיכום", nextStep: "bullish_harami_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "bullish_harami_summary",
    message: "סיכום נר שורי הרמי:\n• שני נרות: דובי גדול + שורי קטן\n• הנר השורי נמצא בתוך הגוף הדובי\n• סימן הפיכה שורית עדין אך אמין\n• הכי אפקטיבי אחרי ירידה\n• נפח נמוך מחזק את הסיגנל",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
