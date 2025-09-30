export const Goal = {
  BULKING: "BULKING",
  CUTTING: "CUTTING",
  BODY_RECOMPOSITION: "BODY_RECOMPOSITION"
} as const;

export type Goal = typeof Goal[keyof typeof Goal];