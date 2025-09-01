import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "מסגרות זמן של נרות: כל נר מייצג תקופה (1דק, 5דק, שעה, יום). אותה צורה — הקשר שונה.",
    backgroundImage: "bg1",
    choices: [
      { text: "דוגמאות", nextStep: "examples" },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "examples",
    message: "פטיש יומי חזק ומשמעותי יותר מפטיש בדקה. מסגרת זמן גבוהה = אות חזק יותר, בתדירות נמוכה יותר.",
    backgroundImage: "bg2",
    choices: [
      { text: "הבנתי", nextStep: "map" },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
    points: 5,
  },
];


