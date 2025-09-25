import multiSelectImg from '../assets/templates/multi-select.png'
import carouselImg from '../assets/templates/carousel.png'
import sequenceImg from '../assets/templates/sequence.png'
import dialogImg from '../assets/templates/dialog.png'
import dragMatchImg from '../assets/templates/drag-match.png'
import questionWithImageImg from '../assets/templates/question-with-image.png'

export const templates = [
  {
    id: 'multi_select_example',
    name: 'Multi Select Question',
    description: 'Choose multiple correct answers.',
    image: multiSelectImg,
    defaultData: {
      id: 'multi_select_example',
      message: '',
      backgroundImage: 'bg2',
      activity: 'multiSelect',
      activityConfig: {
        submitText: 'Check Answer',
        layout: 'grid',
        options: []
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  // {
  //   id: 'multi_select_2_correct',
  //   name: 'Multi Select • 2 correct',
  //   description: 'Prefilled with 4 options, 2 are correct.',
  //   image: multiSelectImg,
  //   defaultData: {
  //     id: 'multi_select_2_correct',
  //     message: 'Choose the two correct items',
  //     backgroundImage: 'bg2',
  //     activity: 'multiSelect',
  //     activityConfig: {
  //       submitText: 'Check',
  //       layout: 'grid',
  //       options: [
  //         { id: 'opt_1', label: 'A', correct: true },
  //         { id: 'opt_2', label: 'B', correct: true },
  //         { id: 'opt_3', label: 'C', correct: false },
  //         { id: 'opt_4', label: 'D', correct: false },
  //       ]
  //     },
  //     choices: [{ text: 'Next', nextStep: 'next' }],
  //   }
  // },
  // {
  //   id: 'multi_select_list',
  //   name: 'Multi Select • List layout',
  //   description: 'Vertical list with 3 options, 1 correct.',
  //   image: multiSelectImg,
  //   defaultData: {
  //     id: 'multi_select_list',
  //     message: 'Pick the correct definition',
  //     backgroundImage: 'bg2',
  //     activity: 'multiSelect',
  //     activityConfig: {
  //       submitText: 'Submit',
  //       layout: 'list',
  //       options: [
  //         { id: 'opt_1', label: 'Definition 1', correct: false },
  //         { id: 'opt_2', label: 'Definition 2', correct: true },
  //         { id: 'opt_3', label: 'Definition 3', correct: false },
  //       ]
  //     },
  //     choices: [{ text: 'Next', nextStep: 'summary' }],
  //   }
  // },
  {
    id: 'carousel_select',
    name: 'Carousel Select',
    description: 'Swipe between items and pick the correct one.',
    image: carouselImg,
    defaultData: {
      id: 'carousel_select',
      message: '',
      backgroundImage: 'bg2',
      activity: 'carouselSelect',
      activityConfig: {
        carousel: { items: [], correctId: '', submitText: 'Confirm' }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  // {
  //   id: 'carousel_3_items',
  //   name: 'Carousel • 3 items',
  //   description: 'Prefilled 3 items with a correct answer.',
  //   image: carouselImg,
  //   defaultData: {
  //     id: 'carousel_3_items',
  //     message: 'Which is correct?',
  //     backgroundImage: 'bg2',
  //     activity: 'carouselSelect',
  //     activityConfig: {
  //       carousel: {
  //         items: [
  //           { id: 'item_1', label: 'One' },
  //           { id: 'item_2', label: 'Two' },
  //           { id: 'item_3', label: 'Three' },
  //         ],
  //         correctId: 'item_2',
  //         submitText: 'Confirm'
  //       }
  //     },
  //     choices: [{ text: 'Next', nextStep: 'map' }],
  //   }
  // },
  // {
  //   id: 'carousel_with_images',
  //   name: 'Carousel • With images',
  //   description: 'Items prepared for adding image keys.',
  //   image: carouselImg,
  //   defaultData: {
  //     id: 'carousel_with_images',
  //     message: 'Pick the matching picture',
  //     backgroundImage: 'bg2',
  //     activity: 'carouselSelect',
  //     activityConfig: {
  //       carousel: {
  //         items: [
  //           { id: 'p1', label: 'Choice A', imageKey: '' },
  //           { id: 'p2', label: 'Choice B', imageKey: '' },
  //           { id: 'p3', label: 'Choice C', imageKey: '' },
  //         ],
  //         correctId: 'p1',
  //         submitText: 'Confirm'
  //       }
  //     },
  //     choices: [{ text: 'Next', nextStep: 'map' }],
  //   }
  // },
  {
    id: 'sequence_build',
    name: 'Sequence Build',
    description: 'Place candles in order to build a pattern.',
    image: sequenceImg,
    defaultData: {
      id: 'sequence_build',
      message: '',
      backgroundImage: 'bg2',
      activity: 'sequenceBuild',
      activityConfig: {
        sequenceBuild: {
          slotsCount: 2,
          options: [],
          correctSequence: [],
          submitText: 'Confirm'
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  {
    id: 'sequence_3_slots',
    name: 'Sequence • 3 slots',
    description: 'Three-slot sequence with 3 options.',
    image: sequenceImg,
    defaultData: {
      id: 'sequence_3_slots',
      message: 'Build the correct 3-step sequence',
      backgroundImage: 'bg2',
      activity: 'sequenceBuild',
      activityConfig: {
        sequenceBuild: {
          slotsCount: 3,
          options: [
            { id: 'opt_a', candleKey: 'bullish' },
            { id: 'opt_b', candleKey: 'bearish' },
            { id: 'opt_c', candleKey: 'doji' },
          ],
          correctSequence: ['opt_a','opt_c','opt_b'],
          submitText: 'Confirm'
        }
      },
      choices: [{ text: 'Next', nextStep: 'map' }],
    }
  },
  {
    id: 'sequence_intro_pattern',
    name: 'Sequence • Intro pattern',
    description: 'Prefilled with two options and 2 slots.',
    image: sequenceImg,
    defaultData: {
      id: 'sequence_intro_pattern',
      message: 'Arrange to form the pattern',
      backgroundImage: 'bg2',
      activity: 'sequenceBuild',
      activityConfig: {
        sequenceBuild: {
          slotsCount: 2,
          options: [
            { id: 's1', candleKey: 'bullishEngulfing' },
            { id: 's2', candleKey: 'bearishEngulfing' },
          ],
          correctSequence: ['s1','s2'],
          submitText: 'Confirm'
        }
      },
      choices: [{ text: 'Next', nextStep: 'map' }],
    }
  },
  {
    id: 'dialog_conversation',
    name: 'Dialog Conversation',
    description: 'Animated conversation between characters.',
    image: dialogImg,
    defaultData: {
      id: 'dialog_conversation',
      message: '',
      backgroundImage: 'bg2',
      activity: 'dialog',
      activityConfig: {
        dialog: {
          messages: [
            {
              id: 'msg_1',
              characterId: 'character1',
              text: 'שלום! היום נלמד על נרות יפניים.',
              delay: 0
            },
            {
              id: 'msg_2',
              characterId: 'character2',
              text: 'מעולה! אני מוכן ללמוד.',
              delay: 0
            },
            {
              id: 'msg_3',
              characterId: 'character1',
              text: 'בואו נתחיל עם הנר הבסיסי ביותר - הנר הבוליש.',
              delay: 0
            }
          ],
          typingSpeed: 50,
          autoAdvance: true,
          autoAdvanceDelay: 2000
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  {
    id: 'dialog_explanation',
    name: 'Dialog • Explanation',
    description: 'Teacher explaining a concept with student responses.',
    image: dialogImg,
    defaultData: {
      id: 'dialog_explanation',
      message: '',
      backgroundImage: 'bg2',
      activity: 'dialog',
      activityConfig: {
        dialog: {
          messages: [
            {
              id: 'msg_1',
              characterId: 'character1',
              text: 'הנר הבוליש מייצג עלייה במחיר.',
              delay: 0
            },
            {
              id: 'msg_2',
              characterId: 'character2',
              text: 'איך אני יכול לזהות אותו?',
              delay: 0
            },
            {
              id: 'msg_3',
              characterId: 'character1',
              text: 'הנר הבוליש הוא ירוק, עם גוף מלא ופתיחה נמוכה יותר מסגירה.',
              delay: 0
            }
          ],
          typingSpeed: 40,
          autoAdvance: true,
          autoAdvanceDelay: 2500
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  {
    id: 'drag_match_drill',
    name: 'Drag Match Drill',
    description: 'Drag tokens to match candlestick patterns.',
    image: dragMatchImg,
    defaultData: {
      id: 'drag_match_drill',
      message: '',
      backgroundImage: 'bg2',
      activity: 'dragMatch',
      activityConfig: {
        dragMatch: {
          slots: [
            { id: 'slot_1', drawKey: 'hammer' },
            { id: 'slot_2', drawKey: 'doji' },
            { id: 'slot_3', drawKey: 'shootingStar' },
            { id: 'slot_4', drawKey: 'dragonflyDoji' }
          ],
          tokens: [
            { id: 'token_1', label: 'Hammer', targetSlotId: 'slot_1' },
            { id: 'token_2', label: 'Doji', targetSlotId: 'slot_2' },
            { id: 'token_3', label: 'Shooting Star', targetSlotId: 'slot_3' },
            { id: 'token_4', label: 'Dragonfly Doji', targetSlotId: 'slot_4' }
          ],
          submitText: 'Check Answer'
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  {
    id: 'drag_match_basic',
    name: 'Drag Match • Basic Patterns',
    description: 'Match basic bullish and bearish patterns.',
    image: dragMatchImg,
    defaultData: {
      id: 'drag_match_basic',
      message: 'Drag the labels to match the candlestick patterns',
      backgroundImage: 'bg2',
      activity: 'dragMatch',
      activityConfig: {
        dragMatch: {
          slots: [
            { id: 'slot_1', drawKey: 'hammer' },
            { id: 'slot_2', drawKey: 'invertedHammerNew' }
          ],
          tokens: [
            { id: 'token_1', label: 'Hammer', targetSlotId: 'slot_1' },
            { id: 'token_2', label: 'Inverted Hammer', targetSlotId: 'slot_2' }
          ],
          submitText: 'Submit'
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  {
    id: 'question_with_image',
    name: 'Question with Image',
    description: 'Single choice question with an image display.',
    image: questionWithImageImg,
    defaultData: {
      id: 'question_with_image',
      message: '',
      backgroundImage: 'bg2',
      activity: 'questionWithImage',
      activityConfig: {
        questionWithImage: {
          question: 'האם הנר הזה הוא סימן חיובי לקניית המניה?',
          imageSource: 'chart_example',
          choices: [
            { id: 'choice_1', text: 'כן זה נר פטיש הפוך והוא אכן מסמן סימן חיובי לקנייה', correct: false },
            { id: 'choice_2', text: 'לא זה נר שמסמן שינוי מגמה לאחר עליות לא ירידות', correct: false },
            { id: 'choice_3', text: 'כן זה נר פטיש והוא אכן מסמן סימן חיובי לקנייה', correct: true },
            { id: 'choice_4', text: 'לא זה נר שמסמן המשך ירידה', correct: false }
          ],
          submitText: 'בדוק'
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  },
  {
    id: 'question_with_image_basic',
    name: 'Question with Image • Basic',
    description: 'Simple question with candlestick chart image.',
    image: questionWithImageImg,
    defaultData: {
      id: 'question_with_image_basic',
      message: '',
      backgroundImage: 'bg2',
      activity: 'questionWithImage',
      activityConfig: {
        questionWithImage: {
          question: 'What type of candlestick pattern is shown?',
          imageSource: 'candlestick_chart',
          choices: [
            { id: 'choice_1', text: 'Hammer', correct: true },
            { id: 'choice_2', text: 'Doji', correct: false },
            { id: 'choice_3', text: 'Shooting Star', correct: false }
          ],
          submitText: 'Submit'
        }
      },
      choices: [{ text: 'Next', nextStep: '' }],
    }
  }
]


