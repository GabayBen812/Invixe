import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    id: "quiz_intro",
    message: "הגיע הזמן לבדוק את הידע שלך! ענה על השאלות הבאות על שוק ההון.",
    backgroundImage: "bg2",
    choices: [
      {
        text: "התחל חידון",
        nextStep: "q1",
      },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topLeft",
  },
  {
    id: "q1",
    message: "איך לדעתך נוצרות מניות?",
    backgroundImage: "bg2",
    choices: [
      {
        text: "כשפותחים חשבון השקעות בבנק",
        nextStep: "wrong1",
      },
      {
        text: "כשהבורסה יוצרת מניות חדשות",
        nextStep: "correct1",
      },
      {
        text: "כשחברה מחלקת את עצמה לגיוס כסף",
        nextStep: "wrong1",
      },
      {
        text: "כשמישהו קונה מניה ממישהו אחר",
        nextStep: "wrong1",
      },
    ],
    characterImg: "character_green_yellow.png",
    bubblePosition: "topRight",
  },
  {
    id: "correct1",
    message: "תשובה נכונה! זכית ב-2 נקודות.",
    backgroundImage: "bg2",
    points: 2,
    choices: [
      {
        text: "שאלה הבאה",
        nextStep: "end",
      },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "wrong1",
    message: "תשובה לא נכונה. נסה שוב בשיעור הבא!",
    backgroundImage: "bg2",
    choices: [
      {
        text: "סיים חידון",
        nextStep: "end",
      },
    ],
    characterImg: "character_orange_yellow.png",
    bubblePosition: "bottomLeft",
  },
  {
    id: "end",
    message: "סיימת את החידון! כל הכבוד.",
    backgroundImage: "bg2",
    choices: [
      {
        text: "חזור למפה",
        nextStep: "map",
      },
    ],
    characterImg: "character_blue_yellow.png",
    bubblePosition: "topLeft",
  },
]; 