import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "התנגדות (תקרה): אזורים בהם המחיר נוטה להיעצר או להסתובב. הסתכלו שמאלה לאיתור אשכולות.",
    backgroundImage: "bg1",
    choices: [
      { text: "טיפ חשוב", nextStep: "tip" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "tip",
    message: "ככל שיש יותר נגיעות ודחיות, הרמה חזקה יותר. שילוב עם דפוסי נרות משפר החלטה.",
    backgroundImage: "bg2",
    choices: [
      { text: "סיום", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 5,
  },
];


