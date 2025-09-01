import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "תמיכה (רצפה): אזורים בהם המחיר נוטה להיעצר ולתקן כלפי מעלה. מאתרים לפי שפלים אזוריים ואזורי ביקוש.",
    backgroundImage: "bg1",
    choices: [
      { text: "טיפ חשוב", nextStep: "tip" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "tip",
    message: "תמיכה חזקה תציג דחיות מרובות עם נפח. חפשו אישור נר בבדיקת תמיכה.",
    backgroundImage: "bg2",
    choices: [
      { text: "סיום", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 5,
  },
];


