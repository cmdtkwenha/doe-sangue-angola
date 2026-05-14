import { brandColors } from "./colors";

export const themeTokens = {
  color: brandColors,
  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
    pill: "999px"
  },
  shadow: {
    card: "0 18px 40px rgba(16, 19, 23, 0.08)",
    panel: "0 24px 70px rgba(16, 19, 23, 0.12)"
  },
  spacing: {
    xs: "6px",
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },
  typography: {
    family: "Inter, system-ui, sans-serif",
    h1: "32px",
    h2: "24px",
    body: "15px",
    caption: "12px"
  },
  motion: {
    fast: "160ms ease",
    normal: "220ms ease",
    slow: "360ms ease"
  }
} as const;
