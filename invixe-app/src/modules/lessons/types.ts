export interface LessonMetadata {
  id: number;
  title: string;
  description: string;
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
