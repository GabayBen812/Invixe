// Invixe Design System Theme
export const colors = {
  // Brand
  brandLogo: "#3F9FFF",

  // Primary
  primary: {
    400: "#3F9FFF",
    500: "#3372D8",
    600: "#2E69C8",
    700: "#295EB4",
  },

  // Accent
  accent: {
    purple500: "#850AFF",
  },

  // Status Colors
  success: {
    100: "#D1FADF",
    600: "#12B76A",
  },
  error: {
    100: "#FEE4E2",
    600: "#D92D20",
  },
  warning: {
    100: "#FEF0C7",
    600: "#F79009",
  },
  info: {
    100: "#E0F2FE",
    600: "#2E90FA",
  },

  // Neutral
  neutral: {
    900: "#0F2233",
    700: "#334A5B",
    500: "#5E7686",
    400: "#8CA0AE",
    300: "#C9D3DE",
    200: "#E2E8EE",
    100: "#F4F7FA",
  },

  // Surface
  surface: {
    bg: "#EAF1F7",
    card: "#FFFFFF",
    overlay: "rgba(15,34,51,0.5)",
    darkBg: "#0F2233",
    darkRaised: "#102A3F",
    darkOverlay: "rgba(0,0,0,0.5)",
    darkChrome: "#0C1A29",
  },

  // Border
  border: {
    subtle: "rgba(15,34,51,0.08)",
    strong: "rgba(15,34,51,0.16)",
    darkSubtle: "rgba(255,255,255,0.08)",
    darkStrong: "rgba(255,255,255,0.16)",
  },

  // Focus & Overlay
  focus: {
    primary: "#3F9FFF",
  },
  overlay: {
    pressed: "rgba(0,0,0,0.06)",
    hover: "rgba(0,0,0,0.03)",
  },

  // Progress
  progress: {
    filled: "#3372D8",
    empty: "#C9D3DE",
    darkEmpty: "rgba(255,255,255,0.16)",
  },

  // Legacy aliases for backward compatibility
  primaryBlue: "#3F9FFF",
  trustBlue: "#334A5B",
  trustBlueDark: "#0F2233",
  trustBlueLight: "#E0F2FE",
  growthGreen: "#12B76A",
  growthGreenDark: "#12B76A",
  growthGreenLight: "#D1FADF",
  optimismYellow: "#F79009",
  optimismOrange: "#D92D20",
  optimismOrangeDark: "#F79009",
  optimismYellowLight: "#FEF0C7",
  white: "#FFFFFF",
  black: "#0F2233",
  gray: "#F4F7FA",
  text: "#0F2233",
  // error: "#D92D20",
  // success: "#12B76A",
};

export const font = {
  family: "Rubik_400Regular",
  bold: "Rubik_700Bold",
  weight: {
    regular: "400",
    bold: "700",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const theme = { colors, font, spacing, radius };

export default theme; 