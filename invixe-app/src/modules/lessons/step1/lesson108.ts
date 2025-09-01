import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור על דפוס שלושה פנימה למטה (Three Inside Down)! זהו דפוס הפיכה חזק המורכב משלושה נרות.",
    backgroundImage: "bg1",
    choices: [
      { text: "בואו נתחיל!", nextStep: "what_is_three_inside_down" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "what_is_three_inside_down",
    message: "דפוס שלושה פנימה למטה מורכב משלושה נרות: הראשון שורי גדול, השני דובי קטן בתוכו, השלישי דובי גדול.",
    backgroundImage: "bg2",
    visual: "threeInsideDownCandle",
    choices: [
      { text: "המשך", nextStep: "three_inside_down_meaning" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "three_inside_down_meaning",
    message: "הדפוס מצביע על כך שהשוריים שלטו, הדוביים התחילו להתאושש, ולבסוף הדוביים לקחו שליטה מלאה.",
    backgroundImage: "bg2",
    visual: "threeInsideDownAction",
    choices: [
      { text: "מה זה אומר?", nextStep: "three_inside_down_signal" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "three_inside_down_signal",
    message: "זהו סימן הפיכה דובית חזק מאוד! הדוביים הצליחו להפוך את המגמה ולקחת שליטה מלאה על השוק.",
    backgroundImage: "bg4",
    visual: "threeInsideDownReversal",
    choices: [
      { text: "איפה זה קורה?", nextStep: "three_inside_down_location" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomRight",
  },
  {
    id: "three_inside_down_location",
    message: "דפוס שלושה פנימה למטה הוא הכי חזק כשהוא מופיע אחרי עלייה ממושכת, בהתנגדות חשובה, או עם נפח גבוה.",
    backgroundImage: "bg1",
    visual: "threeInsideDownResistance",
    choices: [
      { text: "בואו נתאמן!", nextStep: "three_inside_down_practice" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "three_inside_down_practice",
    message: "סמן את כל הדפוסים שהם דפוסי שלושה פנימה למטה אמיתיים:",
    backgroundImage: "bg2",
    activity: 'selectCandles',
    activityConfig: { target: 'threeInsideDown', sampleSize: 6 },
    choices: [
      { text: "בדוק תשובה", nextStep: "three_inside_down_feedback" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "three_inside_down_feedback",
    message: "מעולה! זיהית נכון את דפוסי שלושה פנימה למטה. זכור: שורי גדול + דובי קטן + דובי גדול = הפיכה דובית חזקה.",
    backgroundImage: "bg4",
    visual: "threeInsideDownSummary",
    choices: [
      { text: "סיכום", nextStep: "three_inside_down_summary" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "three_inside_down_summary",
    message: "סיכום דפוס שלושה פנימה למטה:\n• שלושה נרות: שורי גדול + דובי קטן + דובי גדול\n• הנר השני בתוך הראשון, השלישי מתחת לשני\n• סימן הפיכה דובית חזק מאוד\n• הכי אפקטיבי אחרי עלייה\n• נפח גבוה מחזק את הסיגנל",
    backgroundImage: "bg1",
    choices: [
      { text: "סיים שיעור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "bottomLeft",
  },
];
