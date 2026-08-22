export type ThemeName = 'verde-activo' | 'grafito-naranja';

export type SessionStatus = 'upcoming' | 'completed' | 'rest';

export interface ExerciseSet {
  target: string;
  rest: string;
}

export interface ExerciseTechniqueStep {
  label: string;
  description: string;
}

export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  equipmentSetup: string;
  techniqueSteps: ExerciseTechniqueStep[];
  coachingCue: string;
  preparation: string;
  execution: string;
  breathing: string;
  commonMistakes: string[];
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  dayLabel: string;
  title: string;
  focus: string;
  estimatedMinutes: number;
  status: SessionStatus;
  warmUp: string[];
  exercises: Exercise[];
  coolDown: string;
}

export interface PlanWeek {
  number: number;
  goal: string;
  sessions: WorkoutSession[];
}

export interface MonthlyPlan {
  id: string;
  name: string;
  version: string;
  weeks: PlanWeek[];
}

export type PrimaryGoal = 'strength' | 'muscle-gain' | 'general-health' | 'return-to-training';

export type ExperienceLevel = 'beginner' | 'returning' | 'intermediate' | 'advanced';

export type TrainingAvailability = 'two-days' | 'three-days' | 'four-days' | 'five-days';

export type SessionDurationMinutes = 45 | 60 | 75;

export type EquipmentAccess = 'full-gym' | 'basic-gym' | 'home';

export type MeasurementUnits = 'metric' | 'imperial';

export type TrainingPreference = 'guided' | 'simple' | 'varied';

export interface UserProfile {
  firstName: string;
  primaryGoal: PrimaryGoal;
  experience: ExperienceLevel;
  availability: TrainingAvailability;
  sessionDurationMinutes: SessionDurationMinutes;
  equipment: EquipmentAccess;
  limitations: string;
  units: MeasurementUnits;
  trainingPreference: TrainingPreference;
  createdAt: string;
  updatedAt: string;
}

export type ProfileDraft = Omit<UserProfile, 'createdAt' | 'updatedAt'>;

export interface ExerciseTrendPoint {
  label: string;
  load: number;
}

export interface ProgressSnapshot {
  adherencePercent: number;
  completedSessions: number;
  plannedSessions: number;
  monthlyVolumeKg: number;
  volumeChangePercent: number;
  exerciseName: string;
  exerciseTrend: ExerciseTrendPoint[];
  latestNote: string | null;
}
