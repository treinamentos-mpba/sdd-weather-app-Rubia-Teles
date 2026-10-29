import type { Unit } from '../types/weather';

const formatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperatureValue(celsius: number | null, unit: Unit): string {
  if (celsius === null || !Number.isFinite(celsius)) return 'Indisponível';
  const value = convertTemperature(celsius, unit);
  if (!Number.isFinite(value)) return 'Indisponível';
  return formatter.format(Math.abs(value) < 0.05 ? 0 : value);
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  const value = formatTemperatureValue(celsius, unit);
  return value === 'Indisponível' ? value : `${value} ${unitLabel(unit)}`;
}
