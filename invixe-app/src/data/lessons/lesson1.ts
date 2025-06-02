import { LessonStep } from "../../types/lesson";

export const lesson1Steps: LessonStep[] = [
  {
    id: "intro",
    message: "יש ברשותך ארבעה בקבוקי\nיין עליך להחליף כך\nשתשיג את זה:",
    backgroundImage: "bg1",
    choices: [{ text: "קדימה!", nextStep: "start", style: "primary" }],
  },
  {
    id: "start",
    message: "בוא נעשה משהו\nוזה יבהיר\nלך הכל",
    backgroundImage: "bg2",
    choices: [
      { text: "יאללה, מתחילים!", nextStep: "why_money", style: "primary" },
    ],
  },
  {
    id: "why_money",
    message: "אז למה נוצר\nכסף בכלל?",
    backgroundImage: "bg1",
    choices: [
      { text: "בוא נתחיל", nextStep: "grandma_intro", style: "primary" },
    ],
  },
  {
    id: "grandma_intro",
    message: "אני מוכנה לתת\nלך 4 תפוזים\nתמורת 2 בקבוקים",
    backgroundImage: "bg2",
    choices: [
      { text: "סרב", nextStep: "refuse_trade", style: "danger" },
      { text: "החלף", nextStep: "accept_trade", style: "primary" },
    ],
    inventory: {
      wine: 4,
    },
    showInventory: true,
  },
  {
    id: "refuse_trade",
    message: "מה לעשות אתה\nהולך לי אשפיר\nלהחליף ממך",
    backgroundImage: "bg2",
    choices: [{ text: "נסה שוב", nextStep: "grandma_intro", style: "primary" }],
  },
  {
    id: "accept_trade",
    message: "יש נשאר ברשותך\n2 בקבוקים\nאני נותן לך\nתמורת בקבוק יין",
    backgroundImage: "bg4",
    inventory: {
      wine: 2,
      oranges: 4,
    },
    showInventory: true,
    choices: [
      { text: "סרב", nextStep: "refuse_trade2", style: "danger" },
      { text: "החלף", nextStep: "accept_trade2", style: "primary" },
    ],
  },
  {
    id: "refuse_trade2",
    message: "מה לעשות אתה\nהולך לי אשפיר\nלהחליף ממך",
    backgroundImage: "bg2",
    choices: [{ text: "נסה שוב", nextStep: "accept_trade", style: "primary" }],
  },
  {
    id: "accept_trade2",
    message: "תודה רבה לך\nפיקסלה!",
    backgroundImage: "bg2",
    inventory: {
      wine: 1,
      oranges: 4,
      bread: 1,
    },
    showInventory: true,
    choices: [{ text: "המשך", nextStep: "success", style: "primary" }],
  },
  {
    id: "success",
    message: "לא נורא נכשלת\nהיית צריך לשמוע\nאת כל ההצעות\nלפני שקיבלת\nהחלטה",
    backgroundImage: "bg4",
    choices: [
      { text: "נסה שוב", nextStep: "intro", style: "primary" },
      { text: "דלג", nextStep: "summary", style: "secondary" },
    ],
  },
  {
    id: "summary",
    message:
      "אז מה למדנו?\n\n1. מסובך - בעולם המלא כיסף\n2. תמיד תשמע את כל האפשרויות\nלפני שאתה סוגר\n3. קבלת החלטות\nמהירה חשובה במסחר",
    backgroundImage: "bg1",
    choices: [{ text: "לשיעור הבא!", nextStep: "map", style: "primary" }],
  },
];
