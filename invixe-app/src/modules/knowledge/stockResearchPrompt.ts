export type ResearchCategoryVariant = "default" | "danger" | "success";

export type ResearchCategory = {
  id: string;
  label: string;
  variant?: ResearchCategoryVariant;
};

export const STOCK_RESEARCH_QUICK_PICKS = ["AAPL", "TSLA", "NVDA", "NICE"] as const;

export const STOCK_RESEARCH_CATEGORIES: ResearchCategory[] = [
  { id: "business", label: "מה החברה עושה" },
  { id: "sector", label: "סקטור ומתחרות" },
  { id: "revenue", label: "הכנסות וצמיחה" },
  { id: "debt", label: "חוב ותזרים" },
  { id: "profit", label: "רווחיות" },
  { id: "valuation", label: "מכפילים ותמחור" },
  { id: "news", label: "חדשות ואירועים" },
  { id: "analysts", label: "דירוגי אנליסטים" },
  { id: "redflags", label: "דגלים אדומים", variant: "danger" },
  { id: "strengths", label: "חוזקות וסיכונים" },
  { id: "questions", label: "שאלות לבדיקה" },
  { id: "score", label: "ציון 1-10 לכל קטגוריה", variant: "success" },
];

export function buildStockResearchPrompt(rawSymbol: string): string {
  const symbol = rawSymbol.trim();
  const display = symbol.length > 0 ? symbol.toUpperCase() : "______";

  return [
    "אני לומד/ת להשקיע ורוצה סקירה חינוכית ומסודרת על החברה/מנייה הבאה:",
    display,
    "",
    "חשוב:",
    "- זו בקשה ללמידה בלבד — לא ייעוץ השקעות.",
    "- אל תיתן המלצות קנייה, מכירה או החזקה.",
    "- הסבר בעברית פשוטה, מסודרת וברורה.",
    "- ציין רמת ביטחון (גבוהה/בינונית/נמוכה) לכל סעיף לפי איכות המידע.",
    "",
    "נא לנתח לפי 12 נקודות הבדיקה הבאות, ובסוף כל קטגוריה תן ציון 1–10:",
    "",
    "1. מה החברה עושה — מוצרים, שירותים, מקורות הכנסה עיקריים.",
    "2. סקטור ומתחרות — באיזה תחום פועלת, מי המתחרים, יתרון תחרותי.",
    "3. הכנסות וצמיחה — מגמת הכנסות, קצב צמיחה, פיזור גיאוגרפי/מוצרי.",
    "4. חוב ותזרים — רמת חוב, יחס חוב/הון, תזרים מזומנים תפעולי.",
    "5. רווחיות — שולי רווח, ROE/ROA, השוואה לענף.",
    "6. מכפילים ותמחור — P/E, P/S, EV/EBITDA והאם נראה יקר/זול יחסית.",
    "7. חדשות ואירועים — 3–5 אירועים/חדשות משמעותיות מהשנה האחרונה.",
    "8. דירוגי אנליסטים — קונצנזוס, יעדי מחיר (כמידע בלבד, לא המלצה).",
    "9. דגלים אדומים — סיכונים, חששות, נקודות שדורשות זהירות.",
    "10. חוזקות וסיכונים — סיכום SWOT קצר.",
    "11. שאלות לבדיקה — 5 שאלות שכדאי לי לחקור לפני שאני ממשיך ללמוד על המניה.",
    "12. ציון 1–10 לכל קטגוריה — טבלה מסכמת + ציון כללי משוקלל.",
    "",
    "אם חסר מידע עדכני — ציין זאת במפורש ואל תמציא נתונים.",
  ].join("\n");
}
