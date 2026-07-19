export const SkillLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE_LIFTER: "INTERMEDIATE_LIFTER",
  ADVANCED_LIFTER: "ADVANCED_LIFTER"
} as const;

export type SkillLevel = typeof SkillLevel[keyof typeof SkillLevel];