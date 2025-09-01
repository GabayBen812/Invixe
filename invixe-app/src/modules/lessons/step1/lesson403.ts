import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "פריצות: מעבר מעל התנגדות או מתחת לתמיכה. חפשו בדיקת רטסט כדי לצמצם פריצות שווא.",
    backgroundImage: "bg1",
    choices: [
      { text: "תרגול", nextStep: "exercise" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "exercise",
    message: "תרגיל: זיהוי רטסט תקין לעומת פריצת שווא.",
    backgroundImage: "bg2",
    choices: [
      { text: "סיום", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 10,
  },
];


