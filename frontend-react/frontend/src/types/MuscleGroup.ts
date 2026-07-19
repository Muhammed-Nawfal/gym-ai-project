export const MuscleGroup = {
  CHEST: "CHEST",
  BACK: "BACK",
  BICEP: "BICEP",
  TRICEP: "TRICEP",
  SHOULDERS: "SHOULDERS",
  LEG: "LEG",
} as const;

export type MuscleGroup = typeof MuscleGroup[keyof typeof MuscleGroup];
