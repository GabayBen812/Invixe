import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "מה זה לדעתך ניתוח טכני?",
    backgroundImage: "bg1",
    choices: [
      { text: "ניתוח של דוחות כספיים", nextStep: "try_again" },
      { text: "ניתוח של גרפים ודפוסים", nextStep: "build_bearish_harami" },
      { text: "ניתוח של חדשות", nextStep: "try_again" },
      { text: "ניתוח שווי חברה", nextStep: "try_again" },
    ],
    characterImg: "character_orange_noback.png",
    bubblePosition: "center",
  },
  {
    id: "simple_text_step",
    message: "אבל למה שניתוח טכני בכלל יעבוד?.",
    backgroundImage: "bg2",
    choices: [
      { text: "אישור", nextStep: "why_ta" },
    ],
    characterImg: "character_blue_darkblue.png",
    bubblePosition: "center",
    points: 3, // This triggers the bottom sheet
  },
  // {
  //   id: "multi_select_example",
  //   message: "סמן את כל התשובות הנכונות:",
  //   backgroundImage: "bg2",
  //   activity: "multiSelect",
  //   activityConfig: {
  //     submitText: "בדוק תשובה",
  //     layout: "grid",
  //     options: [
  //       { id: "a", label: "פטיש אמיתי", correct: true },
  //       { id: "b", label: "פטיש מזויף", correct: false },
  //       { id: "c", label: "עוד נכון", correct: true },
  //       { id: "d", label: "לא נכון", correct: false }
  //     ]
  //   },
  //   choices: [{ text: "המשך", nextStep: "next_step_id" }],
  //   characterImg: "character_blue_darkblue.png",
  //   bubblePosition: "topRight"
  // },
  // {
  //   id: "carousel_find_inverted_hammer",
  //   message: "השתמשו בחצים כדי למצוא את הפטיש ההפוך",
  //   backgroundImage: "bg2",
  //   activity: "carouselSelect",
  //   activityConfig: {
  //     carousel: {
  //       items: [
  //         { id: "hammer", imageKey: "character_blue_darkblue.png" }, // This will show a character image
  //         { id: "inverted_hammer", imageKey: "character_green_yellow.png" }, // Correct answer
  //         { id: "shooting_star", imageKey: "character_orange_yellow.png" },
  //         { id: "doji", imageKey: "character_blue_yellow.png" },
  //         { id: "dragonfly", imageKey: "character_green_blue.png" }
  //       ],
  //       correctId: "inverted_hammer",
  //       explanationOnWrong: "פטיש הפוך יש לו גוף קטן בתחתית וצל עליון ארוך",
  //       submitText: "אישור"
  //     }
  //   },
  //   choices: [{ text: "המשך", nextStep: "next_step_id" }],
  //   characterImg: "character_green_yellow.png",
  //   bubblePosition: "topRight"
  // },
  {
    id: "build_bearish_harami",
    message: "הציבו 2 נרות בסדר הנכון כדי ליצור הרמי דובי",
    backgroundImage: "bg2",
    activity: "sequenceBuild",
    activityConfig: {
      sequenceBuild: {
        slotsCount: 2,
        options: [
          { id: "bull_big", candleKey: "bullish" },
          { id: "bear_small_inside", candleKey: "bearish" },
          { id: "doji_opt", candleKey: "doji" },
          { id: "hammer_opt", candleKey: "hammer" }
        ],
        // for bearish harami: bullish candle first, then small bearish inside body
        correctSequence: ["bull_big", "bear_small_inside"],
        submitText: "אישור"
      }
    },
    choices: [{ text: "המשך", nextStep: "next_step_id" }],
    characterImg: "character_blue_darkblue.png",
    bubblePosition: "topRight"
  },
  // {
  //   id: "match_words_to_draws",
  //   message: "גרור/י את התיאור לתבנית המתאימה",
  //   backgroundImage: "bg2",
  //   activity: "dragMatch",
  //   activityConfig: {
  //     dragMatch: {
  //       slots: [
  //         { id: "s1", drawKey: "hammer" },
  //         { id: "s2", drawKey: "shootingStar" },
  //         { id: "s3", drawKey: "doji" },
  //         { id: "s4", drawKey: "dragonflyDoji" }
  //       ],
  //       tokens: [
  //         { id: "t1", label: "פטיש", targetSlotId: "s1" },
  //         { id: "t2", label: "כוכב נופל", targetSlotId: "s2" },
  //         { id: "t3", label: "דוג׳י", targetSlotId: "s3" },
  //         { id: "t4", label: "דרגון-פליי דוג׳י", targetSlotId: "s4" }
  //       ],
  //       submitText: "אישור"
  //     }
  //   },
  //   choices: [{ text: "המשך", nextStep: "next_step_id" }],
  //   characterImg: "character_blue_darkblue.png",
  //   bubblePosition: "topRight"
  // },
  {
    id: "try_again",
    message: "לא בדיוק... חשוב/י על גרפים, דפוסים ותנועת מחיר/נפח.",
    backgroundImage: "bg2",
    choices: [
      { text: "אישור", nextStep: "intro" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "center",
    // points: 3, // This triggers the bottom sheet
  },
  {
    id: "why_ta",
    message: "כי בני אדם חוזרים על דפוסים. כשמשקיעים מזהים אותו סימן, הם פועלים דומה — והמחיר מגיב. כמו שמועה על מחסור בביצים: כולם קונים → המחיר מזנק.",
    backgroundImage: "bg1",
    choices: [
      { text: "אישור", nextStep: "course_intro" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    // points: 3, // This triggers the bottom sheet
  },
  {
    id: "course_intro",
    message: "מה מחכה לך: נרות יפניים, מגמות, תמיכה/התנגדות וטיפים פרקטיים. תלמד/י להבין איפה הסיכוי לטובתך ולקבל החלטות רגועות יותר.",
    backgroundImage: "bg2",
    choices: [
      { text: "אישור", nextStep: "disclaimer" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "center",
    // points: 3, // This triggers the bottom sheet
  },
  {
    id: "disclaimer",
    message: "אין קסמים. ניתוח טכני לא מנבא בוודאות — הוא נותן יתרון הסתברותי ומשמעת. משלבים עם ניהול סיכונים וזהב.",
    backgroundImage: "bg1",
    choices: [
      { text: "אישור", nextStep: "coach_intro" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "center",
    // points: 3, // This triggers the bottom sheet
  },
  {
    id: "coach_intro",
    message: "הכיר/י את המנטור שלך: ג׳יי. הוא יקפוץ מדי פעם עם טיפים וכללי ברזל.",
    backgroundImage: "bg1",
    choices: [
      { text: "אישור", nextStep: "summary" },
    ],
    characterImg: "character_blue_darkblue.png",
    bubblePosition: "center",
    // points: 0, // This triggers the bottom sheet
  },
  {
    id: "summary",
    message: "סיכום: ניתוח טכני = שפת השוק. מתחילים בקטן, מתרגלים הרבה, ובטוחים יותר בכל החלטה.",
    backgroundImage: "bg1",
    choices: [
      { text: "אישור", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "center",
    points: 10, // This triggers the bottom sheet
  },
];


