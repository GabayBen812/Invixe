export interface LessonStep {
  id: string;
  message: string;
  backgroundImage: "bg1" | "bg2" | "bg4";
  choices?: Choice[];
  inventory?: Inventory;
  showInventory?: boolean;
  activityConfig?: ActivityConfig;
}

export interface ActivityConfig {
  svgOptions?: any[]; // Legacy support
  // ... other existing configs if any, or just loose typing for now as it seems to be
  explanation?: ExplanationDrillConfig;
  [key: string]: any; // Allow other keys for now to avoid breaking existing code using loose types
}

export interface ExplanationDrillConfig {
  imagePublicUrl?: string; // For Supabase
  imageUrl?: string; // Fallback
  imageType?: 'png' | 'svg';
  explanationText?: string;
  buttonText?: string;
}

export interface Choice {
  text: string;
  nextStep: string;
  style?: "primary" | "secondary" | "danger";
}

export interface Inventory {
  logs?: number;
  bread?: number;
  wine?: number;
  oranges?: number;
}
