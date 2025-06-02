import { LessonStep } from "../types";

export const lesson1Steps: LessonStep[] = [
  {
    id: "intro",
    message:
      "ברוכים הבאים לשיעור הראשון שלכם בשוק ההון! אני אהיה המדריך שלכם במסע הזה.",
    backgroundImage: "bg1",
    choices: [
      {
        text: "בואו נתחיל!",
        nextStep: "explain_stocks",
      },
    ],
  },
  {
    id: "explain_stocks",
    message:
      "שוק ההון הוא המקום בו חברות יכולות לגייס כסף מהציבור, ומשקיעים יכולים להשקיע בחברות אלו.",
    backgroundImage: "bg2",
    choices: [
      {
        text: "איך זה עובד?",
        nextStep: "how_it_works",
      },
    ],
  },
  {
    id: "how_it_works",
    message:
      "כשאתם קונים מניה, אתם למעשה קונים חלק קטן מהחברה! זה אומר שאתם שותפים ברווחים ובהפסדים שלה.",
    backgroundImage: "bg4",
    points: 10,
    choices: [
      {
        text: "סיימתי את השיעור",
        nextStep: "map",
      },
    ],
  },
];
