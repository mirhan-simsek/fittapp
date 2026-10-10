import type { Lang } from './i18n';

export type Muscle = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export interface Exercise {
  id: string;
  muscle: Muscle;
  name: { tr: string; en: string };
}

export interface Program {
  id: string;
  name: { tr: string; en: string };
  desc: { tr: string; en: string };
  days: { name: { tr: string; en: string }; exerciseIds: string[] }[];
}

export interface SetEntry {
  kg: number;
  reps: number;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: SetEntry[];
}

export interface Workout {
  id: string;
  date: string; // ISO
  name: string;
  durationMin: number;
  exercises: LoggedExercise[];
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  kg: number;
}

export interface Measurement {
  date: string; // YYYY-MM-DD
  waist?: number;
  chest?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
}

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  per: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Goals {
  kcal: number;
  protein: number;
  waterMl: number;
  weeklyWorkouts: number;
}

export interface Reminder {
  enabled: boolean;
  days: number[]; // expo weekday: 1 = Sunday ... 7 = Saturday
  hour: number;
  minute: number;
}

export interface AppState {
  lang: Lang;
  workouts: Workout[];
  weights: WeightEntry[];
  measurements: Measurement[];
  meals: Meal[];
  water: Record<string, number>; // YYYY-MM-DD -> ml
  goals: Goals;
  reminder: Reminder;
}
