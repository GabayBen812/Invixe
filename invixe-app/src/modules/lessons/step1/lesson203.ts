import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "תרגול: סמנו את כל הנרות שמתאימות לדפוס פטיש.",
    backgroundImage: "bg1",
    activity: 'selectCandles',
    activityConfig: { target: 'hammer', sampleSize: 4 },
    choices: [
      { text: "סיום", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 10,
  },
];


