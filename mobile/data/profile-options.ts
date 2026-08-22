import type {
  EquipmentAccess,
  ExperienceLevel,
  MeasurementUnits,
  PrimaryGoal,
  SessionDurationMinutes,
  TrainingAvailability,
  TrainingPreference,
} from '@/domain/models';

export interface ProfileOption<TValue extends string | number> {
  value: TValue;
  label: string;
  description: string;
}

export const primaryGoalOptions: readonly ProfileOption<PrimaryGoal>[] = [
  { value: 'strength', label: 'Ganar fuerza', description: 'Progresar con cargas y técnica sólida.' },
  { value: 'muscle-gain', label: 'Ganar masa muscular', description: 'Construir músculo de forma gradual.' },
  { value: 'general-health', label: 'Salud general', description: 'Mantener una rutina activa y completa.' },
  { value: 'return-to-training', label: 'Volver a entrenar', description: 'Retomar el hábito con calma.' },
];

export const experienceOptions: readonly ProfileOption<ExperienceLevel>[] = [
  { value: 'beginner', label: 'Principiante', description: 'Estoy aprendiendo los movimientos básicos.' },
  { value: 'returning', label: 'Vuelvo a entrenar', description: 'Ya entrené antes, pero estoy retomando.' },
  { value: 'intermediate', label: 'Intermedio', description: 'Entreno con regularidad desde hace un tiempo.' },
  { value: 'advanced', label: 'Avanzado', description: 'Tengo experiencia gestionando mi entrenamiento.' },
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

export const equipmentOptions: readonly ProfileOption<EquipmentAccess>[] = [
  { value: 'full-gym', label: 'Gimnasio completo', description: 'Máquinas, barras, mancuernas y banco.' },
  { value: 'basic-gym', label: 'Gimnasio básico', description: 'Mancuernas, banco y algunas máquinas.' },
  { value: 'home', label: 'En casa', description: 'Material disponible en tu espacio de entrenamiento.' },
];

export const trainingPreferenceOptions: readonly ProfileOption<TrainingPreference>[] = [
  { value: 'guided', label: 'Guía paso a paso', description: 'Quiero tener claro qué hacer en cada sesión.' },
  { value: 'simple', label: 'Rutina sencilla', description: 'Prefiero pocos ejercicios y decisiones rápidas.' },
  { value: 'varied', label: 'Algo de variedad', description: 'Me ayuda alternar estímulos y ejercicios.' },
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
