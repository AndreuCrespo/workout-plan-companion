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

export type TrainingAvailability = 'two-days' | 'three-days' | 'four-days' | 'five-days';

export type SessionDurationMinutes = 45 | 60 | 75;

export type MeasurementUnits = 'metric' | 'imperial';

export interface UserProfile {
  firstName: string;
  availability: TrainingAvailability;
  sessionDurationMinutes: SessionDurationMinutes;
  limitations: string;
  units: MeasurementUnits;
  createdAt: string;
  updatedAt: string;
}

export type ProfileDraft = Omit<UserProfile, 'createdAt' | 'updatedAt'>;

export type WorkoutLogStatus = 'in-progress' | 'completed';

export interface LoggedSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  target: string;
  rest: string;
  load: number | null;
  repetitions: number | null;
  rpe: number | null;
  completed: boolean;
}

export type ExerciseFeedbackReaction = 'up' | 'down' | null;

export interface ExerciseFeedback {
  exerciseId: string;
  exerciseName: string;
  reaction: ExerciseFeedbackReaction;
  note: string;
}

export interface WorkoutLog {
  id: string;
  planId: string;
  planVersion: string;
  sessionId: string;
  sessionTitle: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  status: WorkoutLogStatus;
  note: string;
  sets: LoggedSet[];
  exerciseFeedback: ExerciseFeedback[];
}

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
