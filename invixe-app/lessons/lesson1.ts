export interface LessonStep {
  id: string;
  message: string;
  image: any;
  choices: { text: string; nextStep: string; style?: 'primary' | 'secondary' | 'danger' }[];
}

export const lesson1Steps: LessonStep[] = [
  {
    id: 'start',
    message: 'בוא נשחק משחק וזה יבהיר לך הכל',
    image: require('../assets/lesson1_bg1.png'),
    choices: [
      { text: 'יאללה, מתחילים!', nextStep: 'barter_intro', style: 'primary' },
    ],
  },
  {
    id: 'barter_intro',
    message: 'אז מה עשו לפני שהיה כסף?',
    image: require('../assets/lesson1_bg2.png'),
    choices: [
      { text: 'בוא נתחיל', nextStep: 'barter_offer', style: 'primary' },
    ],
  },
  {
    id: 'barter_offer',
    message: 'סבתא תראי מה יש לי להציע לך! גזע עץ ובקבוק יין תמורת התפוזים',
    image: require('../assets/lesson1_bg4.png'),
    choices: [
      { text: 'קדימה!', nextStep: 'barter_success', style: 'primary' },
      { text: 'סירוב', nextStep: 'barter_fail', style: 'danger' },
    ],
  },
  {
    id: 'barter_success',
    message: 'פיקסלה בסוף אתה תמיד משיג מה ששמח אותך בסחר אני מסכים!',
    image: require('../assets/lesson1_bg4.png'),
    choices: [
      { text: 'לשיעור הבא!', nextStep: 'end', style: 'primary' },
    ],
  },
  {
    id: 'barter_fail',
    message: 'שדון קטן תחזור אם יהיה לך מה להציע לי',
    image: require('../assets/lesson1_bg4.png'),
    choices: [
      { text: 'נסה שוב', nextStep: 'barter_offer', style: 'primary' },
    ],
  },
  {
    id: 'end',
    message: 'סיימת את השיעור הראשון! כל הכבוד 🎉',
    image: require('../assets/lesson1_bg1.png'),
    choices: [
      { text: 'למפה', nextStep: 'map', style: 'primary' },
    ],
  },
]; 