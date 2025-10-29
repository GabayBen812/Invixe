import { LessonStep } from '../types';

export const lesson5Steps: LessonStep[] = [
  {
    id: "intro",
    message: "ברוכים הבאים לשיעור הראשון שלנו על השקעות במניות!",
    backgroundImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    choices: [
      {
        id: "continue",
        text: "בואו נתחיל!",
        nextStepId: "what_are_stocks"
      }
    ]
  },
  {
    id: "what_are_stocks",
    message: "מניה היא חלק קטן מחברה. כשאתה קונה מניה, אתה הופך לבעלים קטן של החברה!",
    backgroundImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800",
    choices: [
      {
        id: "learn_more",
        text: "איך זה עובד?",
        nextStepId: "how_it_works"
      }
    ]
  },
  {
    id: "how_it_works",
    message: "כשהחברה מצליחה, הערך של המניה עולה. כשאתה מוכר את המניה, אתה יכול להרוויח כסף!",
    backgroundImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    choices: [
      {
        id: "risks",
        text: "מה הסיכונים?",
        nextStepId: "risks"
      },
      {
        id: "benefits",
        text: "מה היתרונות?",
        nextStepId: "benefits"
      }
    ]
  },
  {
    id: "risks",
    message: "הסיכון העיקרי הוא שהמניה יכולה לרדת בערך, ואתה עלול להפסיד כסף. לכן חשוב ללמוד לפני שמשקיעים!",
    backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
    choices: [
      {
        id: "continue",
        text: "הבנתי",
        nextStepId: "benefits"
      }
    ]
  },
  {
    id: "benefits",
    message: "היתרונות כוללים פוטנציאל לרווחים גבוהים, בעלות על החברה, וחלק מהרווחים (דיבידנדים).",
    backgroundImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    choices: [
      {
        id: "continue",
        text: "מעולה!",
        nextStepId: "conclusion"
      }
    ]
  },
  {
    id: "conclusion",
    message: "עכשיו כשאנחנו יודעים מה זה מניה, בואו נעמיק יותר בשיעורים הבאים!",
    backgroundImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    choices: [
      {
        id: "finish",
        text: "סיימתי את השיעור",
        nextStepId: "end"
      }
    ]
  }
];
