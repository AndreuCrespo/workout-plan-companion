import type { MeasurementUnits } from '@/domain/models';

export const KILOGRAMS_PER_POUND = 0.45359237;

export function loadInKilograms(load: number, units: MeasurementUnits): number {
  return units === 'imperial' ? load * KILOGRAMS_PER_POUND : load;
}

export function loadForDisplay(loadInKilogramsValue: number, units: MeasurementUnits): number {
  const convertedValue = units === 'imperial' ? loadInKilogramsValue / KILOGRAMS_PER_POUND : loadInKilogramsValue;
  return Math.round(convertedValue * 10) / 10;
}
