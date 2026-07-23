//dtos alone

import type { MuscleGroup } from "../types/MuscleGroup";

export interface StartWorkoutRequest {
    userId: number;
    workoutId: number;
}

export interface AddWorkoutToRoutineRequest {
    userId: number;
    workoutId: number;
}

export interface WorkoutDetail {
  id: number;
  name: string;
  description?: string;
  isPredefined: boolean;
  userId: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: number;
  exerciseId: number;
  exerciseName: string;
  orderIndex: number;
  targetSets?: number;
  targetReps?: number;
  restSeconds?: number;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroup? : MuscleGroup;
  tertiaryMuscleGroup?: MuscleGroup;
}

export interface SessionSetDto {
  id: number;
  setIndex: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  completedAt: string | null;
}

export interface PreviousSetDto {
  setIndex: number;
  weight: number | null;
  reps: number | null;
  completed: boolean | null;
}

export interface SessionExerciseDto {
  workoutEntryExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  orderIndex: number;
  targetSets: number | null;
  targetReps: number | null;
  restSeconds: number | null;
  notes?: string | null;
  previousSets: PreviousSetDto[];
  currentSets: SessionSetDto[];
}

export interface StartWorkoutResponse {
  workoutEntryId: number;
  workoutId: number;
  workoutName: string;
  startedAt: string;
  exercises: SessionExerciseDto[];
}

export type Exercise = {
  id: number;
  name: string;
  description: string;
  primaryMuscleGroup: string;
  secondaryMuscleGroup?: string;
  tertiaryMuscleGroup?: string;
};



