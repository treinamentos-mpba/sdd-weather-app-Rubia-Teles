import { describe, expect, it } from 'vitest';
import { mockWeatherData } from '../../src/fixtures/weather';
import { formatTimestamp } from '../../src/lib/format';
import { formatTemperature } from '../../src/lib/temperature';
import { projectWeather } from '../../src/lib/weather';

describe('projeção temporal sem rede', () => {
  it('distingue limites de idade e preserva os valores originais', () => {
    const reference = mockWeatherData.current!.referenceAt;
    const before = structuredClone(mockWeatherData);
    expect(projectWeather(mockWeatherData, reference + 7_200_000).stale).toBe(false);
    expect(projectWeather(mockWeatherData, reference + 7_201_000).stale).toBe(true);
    expect(mockWeatherData).toEqual(before);
  });
  it('rejeita referência futura acima de cinco minutos', () => {
    const reference = mockWeatherData.current!.referenceAt;
    expect(projectWeather(mockWeatherData, reference - 300_000).data.current).not.toBeNull();
    const projection = projectWeather(mockWeatherData, reference - 301_000);
    expect(projection.data.current).toBeNull();
    expect(projection.partial).toBe(true);
  });
  it('avança a janela na virada sem renomear ontem como hoje', () => {
    const projection = projectWeather(mockWeatherData, Date.parse('2026-10-30T03:00:00Z'));
    expect(projection.needsRefresh).toBe(true);
    expect(projection.data.daily.map((day) => day.date)).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
    ]);
    expect(projection.data.daily[4].maximumC).toBeNull();
    expect(projection.partial).toBe(true);
  });
  it('mantém cinco datas de calendário ao atravessar DST e ano novo', () => {
    const source = { ...mockWeatherData, timeZone: 'America/New_York' };
    const dates = projectWeather(source, Date.parse('2026-03-07T17:00:00Z')).data.daily.map(
      (day) => day.date,
    );
    expect(dates).toEqual(['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10', '2026-03-11']);
    expect(projectWeather(source, Date.parse('2026-03-08T07:01:00Z')).data.daily[0].date).toBe(
      '2026-03-08',
    );
    expect(
      projectWeather(mockWeatherData, Date.parse('2027-01-01T01:00:00Z')).data.daily[0].date,
    ).toBe('2026-12-31');
  });
  it('não mostra valores não finitos nem lança erro por horário inválido', () => {
    expect(formatTemperature(Number.MAX_VALUE, 'fahrenheit')).toBe('Indisponível');
    expect(formatTimestamp(Number.NaN, 'UTC')).toBe('Indisponível');
    expect(formatTimestamp(0, 'Invalid/Zone')).toBe('Indisponível');
    expect(formatTimestamp(Number.MAX_VALUE, 'UTC')).toBe('Indisponível');
  });
});
