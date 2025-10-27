export interface LessonMetadata {
  id: number;
  title: string;
  description: string;
  lessonType: 'memorize' | 'info' | 'test' | 'practice';
  unlockRequirements?: {
    completedLessons?: number[];
    minimumPoints?: number;
  };
  sublessons?: Sublesson[];
}

export interface Sublesson {
  id: number;
  title: string;
  description: string;
  lessonType: 'memorize' | 'info' | 'test' | 'practice';
  unlockRequirements?: {
    completedLessons?: number[];
    minimumPoints?: number;
  };
}

export interface LessonStep {
  id: string;
  message: string;
  backgroundImage:
    | "bg1"
    | "bg2"
    | "bg3"
    | "bg4"
    | "bg5"
    | "bg6"
    | "bg7"
    | "bg8"
    | "bg9"
    | "bg10"
    | "bg11";
  choices?: Choice[];
  inventory?: Inventory;
  showInventory?: boolean;
  points?: number; // Points earned for completing this step
  bubblePosition?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'center';
  characterImg?: string; // Filename or key for the character image
  visual?: string; // Optional visual key for SVGs or images
  // Optional interactive activity configuration
  activity?: 'selectCandles' | 'multiSelect' | 'carouselSelect' | 'dragMatch' | 'sequenceBuild' | 'dialog' | 'textWithImageExplain' | 'svgMultiSelect';
  activityConfig?: {
    // Dialog activity config
    dialog?: {
      messages: Array<{
        id: string;
        characterId?: string;
        text: string;
        delay?: number;
      }>;
      typingSpeed?: number;
      autoAdvance?: boolean;
      autoAdvanceDelay?: number;
    };
    // Text with image explain config
    questionWithImage?: {
      imageSource?: string; // optional key for future use
      uploadedImage?: string; // data URI (e.g., data:image/png;base64,...)
      submitText?: string;
      // Inline feedback explanations for question with image drills
      correctExplanation?: string;
      wrongExplanation?: string;
    };
    // Generic multi-select options
    options?: Array<{
      id: string;
      label?: string;
      imageKey?: string;
      correct: boolean;
    }>;
    // SVG multi-select options
    svgOptions?: Array<{
      id: string;
      label?: string;
      svgCode: string;
      correct: boolean;
    }>;
    submitText?: string;
    layout?: 'grid' | 'list';
    // Inline feedback explanations for multi-select drills
    correctExplanation?: string;
    wrongExplanation?: string;
    // Carousel select (single correct) config
    carousel?: {
      items: Array<{
        id: string;
        imageKey?: string;
        label?: string;
      }>;
      correctId: string;
      submitText?: string;
      // Inline feedback explanations for carousel drills
      correctExplanation?: string;
      wrongExplanation?: string;
    };
    // Drag and drop match words to drawings
    dragMatch?: {
      slots: Array<{
        id: string;
        drawKey?: 'hammer' | 'invertedHammerNew' | 'doji' | 'dragonflyDoji' | 'regularDoji' | 'shootingStar';
        imageKey?: string; // optional image instead of drawKey
        labelBelow?: string;
      }>;
      tokens: Array<{
        id: string;
        label: string;
        targetSlotId: string; // correct slot id
      }>;
      submitText?: string;
      // Inline feedback explanations for drag match drills
      correctExplanation?: string;
      wrongExplanation?: string;
    };
    // Build a candle pattern by placing X candles in order
    sequenceBuild?: {
      slotsCount: number; // number of positions to fill (X)
      options: Array<{
        id: string;
        candleKey: 'bullish' | 'bearish' | 'doji' | 'hammer' | 'invertedHammerNew' | 'dragonflyDoji' | 'regularDoji' | 'bullishEngulfing' | 'bearishEngulfing' | 'shootingStar';
      }>;
      correctSequence: string[]; // array of option ids in correct order
      submitText?: string;
      // Inline feedback explanations for sequence build drills
      correctExplanation?: string;
      wrongExplanation?: string;
    };
    // Candle selection config (supports all candle keys used in the app)
    target?:
      | 'bullish'
      | 'bearish'
      | 'doji'
      | 'hammer'
      | 'invertedHammerNew'
      | 'dragonflyDoji'
      | 'regularDoji'
      | 'bullishEngulfing'
      | 'bearishEngulfing'
      | 'bullishHarami'
      | 'bearishHarami'
      | 'shootingStar'
      | 'threeInsideUp'
      | 'threeInsideDown'
      | 'shootingStarEvening'
      | 'shootingStarDay';
    sampleSize?: number; // default 4-6 depending on layout
  };
}

export interface Choice {
  text: string;
  nextStep: string;
  style?: "primary" | "secondary" | "danger";
  consequences?: {
    addInventory?: Partial<Inventory>;
    removeInventory?: Partial<Inventory>;
    points?: number;
  };
}

export interface Inventory {
  logs?: number;
  bread?: number;
  wine?: number;
  oranges?: number;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  currentStep: string;
  inventory: Inventory;
  points: number;
  choices: string[]; // History of choices made
}
