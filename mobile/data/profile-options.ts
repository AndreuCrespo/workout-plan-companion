import type {
  EquipmentAccess,
  MeasurementUnits,
  PrimaryTrainingGoal,
  SessionDurationMinutes,
  TrainingAvailability,
  TrainingEmphasis,
  TrainingExperience,
} from '@/domain/models';

export interface ProfileOption<TValue extends string | number> {
  value: TValue;
  label: string;
  description: string;
}

export const primaryGoalOptions: readonly ProfileOption<PrimaryTrainingGoal>[] = [
  { value: 'strength', label: 'Ganar fuerza', description: 'Mejorar el control y la progresión de movimientos de fuerza.' },
  { value: 'muscle', label: 'Ganar músculo', description: 'Trabajar con una base sostenible de volumen y técnica.' },
  { value: 'general-fitness', label: 'Mejorar mi forma física', description: 'Combinar fuerza, capacidad de trabajo y consistencia.' },
  { value: 'returning', label: 'Retomar el entrenamiento', description: 'Volver al ritmo con margen y progresión gradual.' },
];

export const trainingExperienceOptions: readonly ProfileOption<TrainingExperience>[] = [
  { value: 'starting', label: 'Estoy empezando', description: 'Priorizaremos aprender y repetir movimientos con control.' },
  { value: 'some-experience', label: 'Ya tengo práctica', description: 'Conozco ejercicios básicos y quiero seguir progresando.' },
  { value: 'experienced', label: 'Entreno con experiencia', description: 'Puedo revisar una propuesta con más autonomía.' },
];

export const equipmentAccessOptions: readonly ProfileOption<EquipmentAccess>[] = [
  { value: 'full-gym', label: 'Gimnasio completo', description: 'Barras, banco, máquinas y poleas disponibles.' },
  { value: 'dumbbells-and-bench', label: 'Mancuernas y banco', description: 'Entreno con mancuernas, un banco estable y espacio libre.' },
  { value: 'bands-and-basic', label: 'Bandas y material básico', description: 'Cuento con bandas de resistencia y una esterilla o superficie estable.' },
  { value: 'bodyweight', label: 'Solo peso corporal', description: 'No tengo material de carga disponible ahora mismo.' },
];

export const availabilityOptions: readonly ProfileOption<TrainingAvailability>[] = [
  { value: 'two-days', label: '2 días por semana', description: 'Dos sesiones para avanzar con margen.' },
  { value: 'three-days', label: '3 días por semana', description: 'Un ritmo equilibrado para la mayoría de semanas.' },
  { value: 'four-days', label: '4 días por semana', description: 'Más volumen repartido entre sesiones.' },
  { value: 'five-days', label: '5 días por semana', description: 'Una rutina frecuente y estructurada.' },
];

export const durationOptions: readonly ProfileOption<SessionDurationMinutes>[] = [
  { value: 45, label: '45 minutos', description: 'Sesiones directas y enfocadas.' },
  { value: 60, label: '60 minutos', description: 'Tiempo para calentar, entrenar y cerrar con calma.' },
  { value: 75, label: '75 minutos', description: 'Más margen para descansos y trabajo complementario.' },
];

export const trainingEmphasisOptions: readonly ProfileOption<TrainingEmphasis>[] = [
  {
    value: 'compound-strength',
    label: 'Fuerza con ejercicios multiarticulares',
    description: 'Pide al asistente al menos un patrón multiarticular por sesión cuando encaje con tu material, experiencia y limitaciones.',
  },
  {
    value: 'balanced',
    label: 'Enfoque equilibrado',
    description: 'Reparte el plan sin añadir una prioridad extra de fuerza.',
  },
];

export const unitOptions: readonly ProfileOption<MeasurementUnits>[] = [
  { value: 'metric', label: 'Sistema métrico', description: 'Kilogramos y centímetros.' },
  { value: 'imperial', label: 'Sistema imperial', description: 'Libras y pulgadas.' },
];

export function getProfileOptionLabel<TValue extends string | number>(
  options: readonly ProfileOption<TValue>[],
  value: TValue,
): string {
  return options.find((option) => option.value === value)?.label ?? '';
}

export function getLimitationsLabel(limitations: string): string {
  return limitations.trim() || 'Sin limitaciones declaradas';
}
