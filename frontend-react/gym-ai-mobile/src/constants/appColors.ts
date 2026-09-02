// Single source of truth for this app's color palette (not the unused
// starter-template theme in constants/theme.ts). Used by:
// - existing StyleSheet-based screens/components (import the values directly)
// - tailwind.config.js's theme.extend.colors (for className-based code)
// Keep both in sync if a color here ever changes.

export const appColors = {
  gold: "#d4af37",
  goldDark: "#8a6d1f",
  cardBg: "#0a0a0a",
  black: "#000000",
  white: "#ffffff",
  danger: "#ef4444",
  muted: "#a1a1aa",
  mutedDark: "#71717a",
  ink: "#e4e4e7",
};

export const goldAlpha = (opacity: number) => `rgba(212, 175, 55, ${opacity})`;
export const whiteAlpha = (opacity: number) => `rgba(255, 255, 255, ${opacity})`;
export const blackAlpha = (opacity: number) => `rgba(0, 0, 0, ${opacity})`;
export const dangerAlpha = (opacity: number) => `rgba(239, 68, 68, ${opacity})`;
