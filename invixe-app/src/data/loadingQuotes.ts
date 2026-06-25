export type LoadingQuote = {
  text: string;
  author: string;
};

export const LOADING_QUOTES: LoadingQuote[] = [
  {
    text: "הסיכון מגיע כשאינך יודע מה אתה עושה.",
    author: "וורן באפט",
  },
  {
    text: "השוק הוא מכשיר להעברת כסף מהלא-סבלניים לסבלניים.",
    author: "וורן באפט",
  },
  {
    text: "הזמן הוא חברו של המשקיע הטוב, ואויבו של הרע.",
    author: "וורן באפט",
  },
  {
    text: "אל תחכו לרגע המושלם — התחילו ללמוד ואז תפעלו.",
    author: "פיטר לינץ'",
  },
  {
    text: "השקעה בידע משלמת את הריבית הטובה ביותר.",
    author: "בנג'מין פרנקלין",
  },
  {
    text: "תכנון לטווח ארוך מנצח את תגובות הרגע.",
    author: "ג'ון בוגל",
  },
  {
    text: "פחד וחמדנות הם האויבים הגדולים של המשקיע.",
    author: "בנג'מין גרהם",
  },
  {
    text: "הבנה עמוקה של עקרונות חשובה יותר מניחוש קצר מועד.",
    author: "ריי דאליו",
  },
];

export function quoteIndexForLesson(
  lessonId: number,
  offset = 0,
): number {
  const n = LOADING_QUOTES.length;
  return ((lessonId * 11 + offset * 5) % n + n) % n;
}
