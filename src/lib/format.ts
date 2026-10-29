import type { LocalDate } from '../types/weather';

export function getLocalDate(instant: number, timeZone: string): LocalDate {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(instant);
}

export function formatDay(date: LocalDate, reference: LocalDate | number): string {
  if (reference === 0 || date === reference) return 'Hoje';
  if (reference === 1) return 'Amanhã';
  if (typeof reference === 'string') {
    const tomorrow = new Date(`${reference}T12:00:00Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (date === tomorrow.toISOString().slice(0, 10)) return 'Amanhã';
  }
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`))
    .replace('.', '');
}

export function formatDate(date: LocalDate): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

export const getShortDate = formatDate;

export function formatTimestamp(instant: number, timeZone: string): string {
  if (!Number.isFinite(instant)) return 'Indisponível';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone,
    }).format(instant);
  } catch {
    return 'Indisponível';
  }
}

export function formatMetric(value: number | null, suffix: string): string {
  if (value === null || !Number.isFinite(value)) return 'Indisponível';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${suffix}`;
}
