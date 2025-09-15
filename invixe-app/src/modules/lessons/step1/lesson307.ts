import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על דפוס שלושה פנימה למעלה (Three Inside Up)! זהו דפוס הפיכה חזק המורכב משלושה נרות.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_three_inside_up" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_three_inside_up",
    message: "דפוס שלושה פנימה למעלה מורכב משלושה נרות: הראשון דובי גדול, השני שורי קטן בתוכו, השלישי שורי גדול.",
    backgroundImage: "bg2",
    visual: "threeInsideUpCandle",
    choices: [
      { text: "המשך", nextStep: "three_inside_up_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "three_inside_up_meaning",
    message: "הדפוס מצביע על כך שהדוביים שלטו, השוריים התחילו להתאושש, ולבסוף השוריים לקחו שליטה מלאה.",
    backgroundImage: "bg2",
    visual: "threeInsideUpAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "three_inside_up_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "three_inside_up_signal",
    message: "זהו סימן הפיכה שורית חזק מאוד! השוריים הצליחו להפוך את המגמה ולקחת שליטה מלאה על השוק.",
    backgroundImage: "bg4",
    visual: "threeInsideUpReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "three_inside_up_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "three_inside_up_location",
    message: "דפוס שלושה פנימה למעלה הוא הכי חזק כשהוא מופיע אחרי ירידה ממושכת, בתמיכה חשובה, או עם נפח גבוה.",
    backgroundImage: "bg1",
    visual: "threeInsideUpSupport",
    choices: [
      { text: "בואו נתאמן!", nextStep: "three_inside_up_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "three_inside_up_practice",
    message: "סמן את כל הדפוסים שהם דפוסי שלושה פנימה למעלה אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'threeInsideUp', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "three_inside_up_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "three_inside_up_feedback",
    message: "מעולה! זיהית נכון את דפוסי שלושה פנימה למעלה. זכור: דובי גדול + שורי קטן + שורי גדול = הפיכה שורית חזקה.",
    backgroundImage: "bg4",
    visual: "threeInsideUpSummary",
    choices: [
      { text: "סיכום", nextStep: "three_inside_up_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "three_inside_up_summary",
    message: "סיכום דפוס שלושה פנימה למעלה:\n• שלושה נרות: דובי גדול + שורי קטן + שורי גדול\n• הנר השני בתוך הראשון, השלישי מעל השני\n• סימן הפיכה שורית חזק מאוד\n• הכי אפקטיבי אחרי ירידה\n• נפח גבוה מחזק את הסיגנל",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
