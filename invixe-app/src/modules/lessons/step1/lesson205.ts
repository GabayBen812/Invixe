import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "הבנת מגמות: שיאים ושפלים עולים (מגמת עליה); שיאים ושפלים יורדים (מגמת ירידה).",
    backgroundImage: "bg1",
    choices: [
      { text: "אישורים", nextStep: "confirmations" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "confirmations",
    message: "השתמשו בנרות בעת תיקונים ובשבירת מבנה לקבלת אישור.",
    backgroundImage: "bg2",
    choices: [
      { text: "סיום", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 5,
  },
];


