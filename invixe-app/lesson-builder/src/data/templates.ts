import multiSelectImg from '../assets/templates/multi-select.png'
import carouselImg from '../assets/templates/carousel.png'
import sequenceImg from '../assets/templates/sequence.png'

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
  }
]


