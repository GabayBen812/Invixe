export interface StepRegistry {
  step: number;
  lessons: LessonMetadata[];
  unitId?: string;
}

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
  showCharacter?: boolean; // Whether to show character in speech bubble (default: true)
  visual?: string; // Optional visual key for SVGs or images
  // Optional interactive activity configuration
  activity?:
    | 'selectCandles'
    | 'multiSelect'
    | 'carouselSelect'
    | 'dragMatch'
    | 'sequenceBuild'
    | 'dialog'
    | 'textWithImageExplain'
    | 'svgMultiSelect'
    | 'questionWithImage'
    | 'questionWithSVG'
    | 'textWithSVG'
    | 'simple_question'
    | 'pathSelect'
    | 'explanation';
  activityConfig?: {
    // Simple question config (single choice with explanations)
    rewards?: number; // Points/rewards for correct answer
    correctExplanation?: string; // Explanation shown when answer is correct
    wrongExplanation?: string; // Explanation shown when answer is wrong
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
    // Question with image config (also used for questionWithSVG and textWithSVG)
    questionWithImage?: {
      question?: string; // Question text for questionWithImage/questionWithSVG
      imageSource?: string; // optional key for future use
      uploadedImage?: string; // data URI (e.g., data:image/png;base64,...)
      uploadedImageUrl?: string; // blob URL
      uploadedImagePublicUrl?: string; // public URL (e.g., Supabase storage URL)
      uploadedImagePath?: string; // storage path
      svgCode?: string; // SVG markup string for questionWithSVG/textWithSVG
      svgUrl?: string; // SVG blob URL or public URL for preview
      svgPublicUrl?: string; // SVG Supabase storage public URL
      svgPath?: string; // SVG storage path
      choices?: Array<{
        id: string;
        text: string;
        correct: boolean;
      }>; // Choices for questionWithImage/questionWithSVG
      submitText?: string;
      // Inline feedback explanations for question with image/SVG drills
      correctExplanation?: string;
      wrongExplanation?: string;
      rewards?: number; // Points/rewards for correct answer
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
      svgCode?: string; // Legacy: inline SVG code (for backward compatibility)
      svgUrl?: string; // Blob URL or public URL for preview
      svgPublicUrl?: string; // Supabase storage public URL
      svgPath?: string; // Storage path
      pngUrl?: string; // PNG blob URL or public URL
      pngPublicUrl?: string; // PNG Supabase storage public URL
      pngPath?: string; // PNG storage path
      inputType?: 'svg' | 'png'; // Type of input used
      correct: boolean;
    }>;
    // Builder format (also supported for compatibility)
    svgMultiSelect?: {
      options?: Array<{
        id: string;
        label?: string;
        svgCode?: string;
        svgUrl?: string;
        svgPublicUrl?: string;
        svgPath?: string;
        pngUrl?: string;
        pngPublicUrl?: string;
        pngPath?: string;
        inputType?: 'svg' | 'png';
        correct: boolean;
      }>;
      submitText?: string;
      layout?: 'grid' | 'list';
      rewards?: number;
      correctExplanation?: string;
      wrongExplanation?: string;
    };
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
        // Optional SVG support for slots (for lesson-builder generated SVG candles)
        svgCode?: string;
        svgUrl?: string;
        svgPublicUrl?: string;
        svgPath?: string;
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
      correctSequence?: string[]; // DEPRECATED: use correctSequences instead. Kept for backward compatibility
      correctSequences?: string[][]; // array of arrays, each array is a valid sequence of option ids
      submitText?: string;
      // Inline feedback explanations for sequence build drills
      correctExplanation?: string;
      wrongExplanation?: string;
    };
    // Standalone explanation screen (image + rich text)
    explanation?: {
      imagePublicUrl?: string; // Public URL for explanation image (e.g. Supabase)
      imageUrl?: string; // Fallback URL (blob or other)
      imageType?: 'svg' | 'png'; // Explicit type hint
      explanationText?: string; // Main explanation body text
      buttonText?: string; // Optional button label (e.g. 'המשך')
    };

    // Path/Topic selection drill - allows users to explore multiple topics
    pathSelect?: {
      choices: Array<{
        id: string;
        text: string;
        explanation?: string; // Text explanation for this path
        explanationImageUrl?: string; // Optional image URL for explanation
        explanationImagePath?: string; // Optional image path
        explanationSvgCode?: string; // Optional SVG code for explanation
        explanationSvgUrl?: string; // Optional SVG URL for explanation
        explanationSvgPublicUrl?: string; // Optional SVG public URL
        explanationSvgPath?: string; // Optional SVG path
        isComplexMedia?: boolean; // If true, enables zoom/expand functionality
        // Optional additional explanation screens for this path choice.
        // The runtime will show the main explanation (fields above) first,
        // then each of these screens in order before marking the option complete.
        extraExplanations?: Array<{
          id: string;
          explanation?: string;
          explanationImageUrl?: string;
          explanationImagePath?: string;
          explanationSvgCode?: string;
          explanationSvgUrl?: string;
          explanationSvgPublicUrl?: string;
          explanationSvgPath?: string;
          isComplexMedia?: boolean; // If true, enables zoom/expand functionality
        }>;
      }>;
      submitText?: string; // Text for continue button (default: 'המשך')
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
  dictionaryTopicId?: string;
  dictionaryTermId?: string;
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
