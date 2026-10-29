import type { ForecastDay, WeatherData } from '../types/weather';
import { getLocalDate } from './format';

export function projectWeather(source: WeatherData, now: number) {
  const today = getLocalDate(now, source.timeZone);
  const byDate = new Map(source.daily.map((day) => [day.date, day]));
  const daily = Array.from({ length: 5 }, (_, offset): ForecastDay => {
    const calendar = new Date(`${today}T12:00:00Z`);
    calendar.setUTCDate(calendar.getUTCDate() + offset);
    const date = calendar.toISOString().slice(0, 10);
    return (
      byDate.get(date) ?? {
        date,
        minimumC: null,
        maximumC: null,
        conditionCode: null,
        precipitationProbabilityPercent: null,
      }
    );
  });
  const current =
    source.current && source.current.referenceAt <= now + 300_000 ? source.current : null;
  const data = { ...source, current, daily };
  const partial =
    !current ||
    Object.values(current).some((value) => value == null) ||
    daily.some((day) => Object.values(day).some((value) => value == null));
  const stale = current !== null && now - current.referenceAt > 7_200_000;
  const needsRefresh = today !== getLocalDate(source.obtainedAt, source.timeZone);
  return { data, partial, stale, needsRefresh };
}
