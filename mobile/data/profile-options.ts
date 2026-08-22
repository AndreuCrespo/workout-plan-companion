import type { MeasurementUnits, SessionDurationMinutes, TrainingAvailability } from '@/domain/models';

export interface ProfileOption<TValue extends string | number> {
  value: TValue;
  label: string;
  description: string;
}

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
