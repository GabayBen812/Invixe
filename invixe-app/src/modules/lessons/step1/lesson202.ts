import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "איך לקרוא נרות: פתיחה, שיא, שפל, סגירה. הגוף מצביע על כיוון; פתילים מראים דחייה ותנודתיות.",
    backgroundImage: "bg1",
    choices: [
      { text: "החלקים העיקריים", nextStep: "anatomy" },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "anatomy",
    message: "פתילים ארוכים = דחייה. גוף ארוך = מומנטום. ההקשר חשוב (מגמה/תמיכה-התנגדות).",
    backgroundImage: "bg2",
    choices: [
      { text: "המשך", nextStep: "map" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topRight",
    points: 5,
  },
];


