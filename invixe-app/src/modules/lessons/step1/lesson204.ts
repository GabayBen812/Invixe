import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "הסיפור של הנרות היפניים: נולדו ביפן של המאה ה-18 למסחר באורז, והופצו במערב ע" +
      "י סטיב ניסון.",
    backgroundImage: "bg1",
    choices: [
      { text: "מגניב", nextStep: "map" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
    points: 5,
  },
];


