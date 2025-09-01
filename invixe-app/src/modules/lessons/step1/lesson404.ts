import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "שילוב נרות עם תמיכה/התנגדות: חפשו נרות היפוך באזורים לשיפור הסתברות.",
    backgroundImage: "bg1",
    choices: [
      { text: "דוגמה", nextStep: "example" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "example",
    message: "לדוגמה: בליעה שורית על אזור תמיכה לאחר תיקון. קונפלואנס מעלה ביטחון בהחלטה.",
    backgroundImage: "bg2",
    choices: [
      { text: "סיום", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 10,
  },
];


