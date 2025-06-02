export interface LessonStep {
  id: string;
  message: string;
  backgroundImage: "bg1" | "bg2" | "bg4";
  choices?: Choice[];
  inventory?: Inventory;
  showInventory?: boolean;
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
