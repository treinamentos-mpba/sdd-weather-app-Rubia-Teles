import { describe, expect, it } from 'vitest';
import { mockWeatherData } from '../../src/fixtures/weather';
import {
  formatDate,
  formatDay,
  formatMetric,
  formatTimestamp,
  getLocalDate,
  getShortDate,
} from '../../src/lib/format';

describe('rótulos da previsão', () => {
  it.each([
    ['2026-10-29', 0, 'Hoje'],
    ['2026-10-30', 1, 'Amanhã'],
    ['2026-10-31', 2, 'sáb'],
    ['2026-11-01', 3, 'dom'],
    ['2026-11-02', 4, 'seg'],
  ] as const)('%s no índice %s recebe %s', (date, index, label) => {
    expect(formatDay(date, index)).toBe(label);
  });
  it('preserva a chamada por data e identifica amanhã na virada do ano', () => {
    expect(formatDay('2026-12-31', '2026-12-31')).toBe('Hoje');
    expect(formatDay('2027-01-01', '2026-12-31')).toBe('Amanhã');
    expect(formatDay('2027-01-02', '2026-12-31')).toBe('sáb');
  });
  it('a fixture cobre cinco datas consecutivas, incluindo a virada de mês', () => {
    expect(mockWeatherData.daily.map((day) => day.date)).toEqual([
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
  });
});

describe('datas, fuso e métricas', () => {
  it.each([
    ['2026-01-02', '02/01'],
    ['2026-12-31', '31/12'],
    ['2028-02-29', '29/02'],
  ])('formata %s como %s', (date, expected) => {
    expect(getShortDate(date)).toBe(expected);
    expect(formatDate(date)).toBe(expected);
  });
  it('usa o fuso da cidade e não o do dispositivo', () => {
    const instant = Date.parse('2027-01-01T01:00:00Z');
    expect(getLocalDate(instant, 'America/Sao_Paulo')).toBe('2026-12-31');
    expect(getLocalDate(instant, 'Asia/Tokyo')).toBe('2027-01-01');
    expect(formatTimestamp(instant, 'America/Sao_Paulo')).toContain('31/12/2026');
    expect(formatTimestamp(instant, 'America/Sao_Paulo')).toContain('22:00');
    expect(() => getLocalDate(instant, 'Invalid/Zone')).toThrow(RangeError);
  });
  it('distingue zero, arredondamento e ausência', () => {
    expect(formatMetric(0, 'mm')).toBe('0 mm');
    expect(formatMetric(12.45, 'km/h')).toBe('12,5 km/h');
    expect(formatMetric(null, '%')).toBe('Indisponível');
    expect(formatMetric(Number.NaN, '%')).toBe('Indisponível');
  });
});
