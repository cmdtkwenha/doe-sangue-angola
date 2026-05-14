export const brandColors = {
  red: "#d71920",
  deepRed: "#a90f18",
  black: "#101317",
  ink: "#1f2933",
  white: "#ffffff",
  softWhite: "#f8fafc",
  gold: "#f4b740",
  green: "#159957",
  yellow: "#f6a609",
  blue: "#2563eb"
} as const;

export const statusColors = {
  critical: brandColors.red,
  warning: brandColors.yellow,
  stable: brandColors.green,
  info: brandColors.blue
} as const;
