import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "מה זה לדעתך ניתוח טכני?",
    backgroundImage: "bg1",
    choices: [
      { text: "ניתוח של דוחות כספיים", nextStep: "try_again" },
      { text: "ניתוח של גרפים ודפוסים", nextStep: "correct_def" },
      { text: "ניתוח של חדשות", nextStep: "try_again" },
      { text: "ניתוח שווי חברה", nextStep: "try_again" },
    ],
    characterImg: "character_orange_noback.png",
    bubblePosition: "center",
  },
  {
    id: "try_again",
    message: "לא בדיוק... חשוב/י על גרפים, דפוסים ותנועת מחיר/נפח.",
    backgroundImage: "bg2",
    choices: [
      { text: "חזרה לשאלה", nextStep: "intro" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "correct_def",
    message: "אבל למה שניתוח טכני בכלל יעבוד.",
    backgroundImage: "bg1",
    choices: [
      { text: "ולמה זה עובד?", nextStep: "why_ta" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 5,
  },
  {
    id: "why_ta",
    message: "כי בני אדם חוזרים על דפוסים. כשמשקיעים מזהים אותו סימן, הם פועלים דומה — והמחיר מגיב. כמו שמועה על מחסור בביצים: כולם קונים → המחיר מזנק.",
    backgroundImage: "bg1",
    choices: [
      { text: "מה נלמד בקורס", nextStep: "course_intro" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "course_intro",
    message: "מה מחכה לך: נרות יפניים, מגמות, תמיכה/התנגדות וטיפים פרקטיים. תלמד/י להבין איפה הסיכוי לטובתך ולקבל החלטות רגועות יותר.",
    backgroundImage: "bg2",
    choices: [
      { text: "טיפ חשוב", nextStep: "disclaimer" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "disclaimer",
    message: "אין קסמים. ניתוח טכני לא מנבא בוודאות — הוא נותן יתרון הסתברותי ומשמעת. משלבים עם ניהול סיכונים וזהב.",
    backgroundImage: "bg1",
    choices: [
      { text: "המשך", nextStep: "coach_intro" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "coach_intro",
    message: "הכיר/י את המנטור שלך: ג׳יי. הוא יקפוץ מדי פעם עם טיפים וכללי ברזל.",
    backgroundImage: "bg1",
    choices: [
      { text: "יאללה נתחיל", nextStep: "summary" },
    ],
    characterImg: "character_blue_darkblue.png",
    bubblePosition: "topRight",
  },
  {
    id: "summary",
    message: "סיכום: ניתוח טכני = שפת השוק. מתחילים בקטן, מתרגלים הרבה, ובטוחים יותר בכל החלטה.",
    backgroundImage: "bg1",
    choices: [
      { text: "יאללה למפה", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 10,
  },
];


