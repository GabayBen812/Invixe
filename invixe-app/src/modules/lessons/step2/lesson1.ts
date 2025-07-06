import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "intro",
    message: "אז מה זו בכלל בורסה?",
    backgroundImage: "bg1",
    choices: [
      {
        text: "בוא נתחיל!",
        nextStep: "explain_market",
      },
    ],
  },
  {
    id: "explain_market",
    message: "ברוסה זה שוק...",
    backgroundImage: "bg2",
    choices: [
      {
        text: "המשך",
        nextStep: "not_physical",
      },
    ],
  },
  {
    id: "not_physical",
    message: "אבל לא ממש לא בזה!",
    backgroundImage: "bg3",
    choices: [
      {
        text: "המשך",
        nextStep: "buying_process",
      },
    ],
  },
  {
    id: "buying_process",
    message: "במקום לקנות מבוגר מטבריה...",
    backgroundImage: "bg4",
    choices: [
      {
        text: "המשך",
        nextStep: "stocks_intro",
      },
    ],
  },
  {
    id: "stocks_intro",
    message: "קונים ומוכרים מניות",
    backgroundImage: "bg5",
    choices: [
      {
        text: "איך לדעת?",
        nextStep: "how_to_know",
      },
    ],
  },
  {
    id: "how_to_know",
    message:
      "כשחברה רוצה לגייס כסף, היא צריכה להיות מאושרת לפי כללים מסוימים לפני שתוכל להיכנס לבורסה.",
    backgroundImage: "bg6",
    choices: [
      {
        text: "מעולה!",
        nextStep: "what_is_stock",
      },
    ],
  },
  {
    id: "what_is_stock",
    message: "בוא נבין דוגמה אמיתית?",
    backgroundImage: "bg7",
    choices: [
      {
        text: "המשך",
        nextStep: "stock_example",
      },
    ],
  },
  {
    id: "stock_example",
    message:
      "כשחברה רוצה לגייס כסף, היא צריכה להיות מאושרת לפי כללים מסוימים לפני שתוכל להיכנס לבורסה.",
    backgroundImage: "bg8",
    choices: [
      {
        text: "נכון מאוד!",
        nextStep: "correct_answer",
      },
    ],
  },
  {
    id: "correct_answer",
    message:
      "מניה היא חלק מהבעלות על חברה. ברגע שאתה קונה מניה של חברה, אתה הופך להיות בעלים על שותף קטן באותה חברה.",
    backgroundImage: "bg9",
    points: 10,
    choices: [
      {
        text: "איך מניה משתנה?",
        nextStep: "how_to_profit",
      },
    ],
  },
  {
    id: "how_to_profit",
    message:
      "לדוגמה, שווי מניה אחת של טסלה מגיע ל-300 דולר. לאחר שבוע, המחיר עולה ל-310 דולר. אם תמכור את המניה ברגע שהייתה בעלייה.",
    backgroundImage: "bg10",
    choices: [
      {
        text: "אבל איך ולמה המניה משתנה?",
        nextStep: "why_stock_changes",
      },
    ],
  },
  {
    id: "why_stock_changes",
    message: "ממש עוד מעט ותדע הכל! בשיעור הבא!",
    backgroundImage: "bg11",
    choices: [
      {
        text: "לשיעור הבא",
        nextStep: "map",
      },
    ],
  },
]; 