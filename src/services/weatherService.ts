import { getLocalDate } from '../lib/format';
import { isWeatherCode } from '../lib/weatherCodes';
import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';
import { fetchWithTimeout } from './http';
import { WeatherServiceError } from './weatherServiceError';

export { WeatherServiceError } from './weatherServiceError';

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function measure(value: unknown, minimum = 0, maximum = Number.POSITIVE_INFINITY): number | null {
  const number = numeric(value);
  return number !== null && number >= minimum && number <= maximum ? number : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];
  const payload = record(
    await fetchWithTimeout(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
      signal,
    ),
  );
  if (!payload || ('results' in payload && !Array.isArray(payload.results))) {
    throw new WeatherServiceError('Resposta inválida na busca de cidades.');
  }
  if (!('results' in payload)) {
    return [];
  }
  const results = payload.results as unknown[];
  const cities = results.flatMap((result): City[] => {
    const city = record(result);
    if (!city) return [];
    const latitude = measure(city.latitude, -90, 90);
    const longitude = measure(city.longitude, -180, 180);
    const name = text(city.name);
    if (!name || latitude === null || longitude === null) return [];
    return [
      {
        key: `open-meteo:${numeric(city.id) ?? `${latitude},${longitude}`}`,
        name,
        region: text(city.admin1),
        country: text(city.country),
        latitude,
        longitude,
      },
    ];
  });
  if (results.length && !cities.length)
    throw new WeatherServiceError('Nenhuma localidade válida na resposta.');
  return cities.slice(0, 10);
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  if (measure(city.latitude, -90, 90) === null || measure(city.longitude, -180, 180) === null) {
    throw new WeatherServiceError('Coordenadas da cidade inválidas.');
  }
  const parameters = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code',
    daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timeformat: 'unixtime',
  });
  const payload = record(
    await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${parameters}`, signal),
  );
  const current = record(payload?.current);
  const daily = record(payload?.daily);
  if (!payload || !current || !daily || !Array.isArray(daily.time)) {
    throw new WeatherServiceError('Resposta incompleta da previsão.');
  }
  const obtainedAt = Date.now();
  const timeZone = text(payload.timezone);
  if (!timeZone) throw new WeatherServiceError('Fuso horário ausente na previsão.');
  let today: string;
  try {
    today = getLocalDate(obtainedAt, timeZone);
  } catch {
    throw new WeatherServiceError('Fuso horário inválido na previsão.');
  }

  const currentUnits = record(payload.current_units);
  const dailyUnits = record(payload.daily_units);
  const referenceSeconds = numeric(current.time);
  const referenceAt = referenceSeconds === null ? null : referenceSeconds * 1000;
  const mappedCurrent: CurrentWeather | null =
    referenceAt !== null &&
    currentUnits?.time === 'unixtime' &&
    Number.isFinite(new Date(referenceAt).getTime()) &&
    referenceAt <= obtainedAt + 300_000
      ? {
          referenceAt,
          temperatureC:
            currentUnits?.temperature_2m === '°C' ? numeric(current.temperature_2m) : null,
          conditionCode:
            currentUnits?.weather_code === 'wmo code' && isWeatherCode(current.weather_code)
              ? current.weather_code
              : null,
          humidityPercent:
            currentUnits?.relative_humidity_2m === '%'
              ? measure(current.relative_humidity_2m, 0, 100)
              : null,
          windSpeedKmh:
            currentUnits?.wind_speed_10m === 'km/h' ? measure(current.wind_speed_10m) : null,
          precipitationMm:
            currentUnits?.precipitation === 'mm'
              ? current.precipitation === null
                ? 0
                : measure(current.precipitation)
              : null,
          pressureHpa:
            currentUnits?.surface_pressure === 'hPa' ? measure(current.surface_pressure, 1) : null,
        }
      : null;

  const byDate = new Map<string, ForecastDay | null>();
  for (const [index, time] of daily.time.entries()) {
    const seconds = numeric(time);
    if (
      seconds === null ||
      dailyUnits?.time !== 'unixtime' ||
      !Number.isFinite(new Date(seconds * 1000).getTime())
    )
      continue;
    const date = getLocalDate(seconds * 1000, timeZone);
    if (byDate.has(date)) {
      byDate.set(date, null);
      continue;
    }
    const field = (name: string) => (Array.isArray(daily[name]) ? daily[name][index] : undefined);
    let minimumC =
      dailyUnits?.temperature_2m_min === '°C' ? numeric(field('temperature_2m_min')) : null;
    let maximumC =
      dailyUnits?.temperature_2m_max === '°C' ? numeric(field('temperature_2m_max')) : null;
    if (minimumC !== null && maximumC !== null && minimumC > maximumC) {
      minimumC = null;
      maximumC = null;
    }
    byDate.set(date, {
      date,
      minimumC,
      maximumC,
      conditionCode:
        dailyUnits?.weather_code === 'wmo code' && isWeatherCode(field('weather_code'))
          ? Number(field('weather_code'))
          : null,
      precipitationProbabilityPercent:
        dailyUnits?.precipitation_probability_max === '%'
          ? measure(field('precipitation_probability_max'), 0, 100)
          : null,
    });
  }
  const forecast = Array.from({ length: 5 }, (_, offset): ForecastDay => {
    const calendar = new Date(`${today}T00:00:00Z`);
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
  const hasCurrent =
    mappedCurrent &&
    Object.entries(mappedCurrent).some(
      ([field, value]) => field !== 'referenceAt' && value !== null,
    );
  const hasDaily = forecast.some((day) =>
    Object.entries(day).some(([field, value]) => field !== 'date' && value !== null),
  );
  if (!hasCurrent && !hasDaily)
    throw new WeatherServiceError('A previsão não contém dados utilizáveis.');
  return { city, timeZone, obtainedAt, current: mappedCurrent, daily: forecast };
}
