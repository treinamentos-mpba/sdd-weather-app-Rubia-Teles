import type { Page } from '@playwright/test';
import { mockWeatherData } from '../../src/fixtures/weather';

export const fixtureNow = mockWeatherData.obtainedAt;
export const geocodingResponse = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      admin1: 'São Paulo',
      country: 'Brasil',
      latitude: -23.55,
      longitude: -46.63,
    },
  ],
};

export const forecastResponse = {
  timezone: mockWeatherData.timeZone,
  current_units: {
    time: 'unixtime',
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    wind_speed_10m: 'km/h',
    precipitation: 'mm',
    surface_pressure: 'hPa',
    weather_code: 'wmo code',
  },
  current: {
    time: (mockWeatherData.current?.referenceAt ?? fixtureNow) / 1000,
    temperature_2m: 24.5,
    relative_humidity_2m: 64,
    wind_speed_10m: 12.4,
    precipitation: 0,
    surface_pressure: 1014,
    weather_code: 2,
  },
  daily_units: {
    time: 'unixtime',
    temperature_2m_min: '°C',
    temperature_2m_max: '°C',
    weather_code: 'wmo code',
    precipitation_probability_max: '%',
  },
  daily: {
    time: mockWeatherData.daily.map((day) => Date.parse(`${day.date}T03:00:00Z`) / 1000),
    temperature_2m_min: mockWeatherData.daily.map((day) => day.minimumC),
    temperature_2m_max: mockWeatherData.daily.map((day) => day.maximumC),
    weather_code: mockWeatherData.daily.map((day) => day.conditionCode),
    precipitation_probability_max: mockWeatherData.daily.map(
      (day) => day.precipitationProbabilityPercent,
    ),
  },
};

export async function mockWeatherApi(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date(fixtureNow));
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocodingResponse }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: forecastResponse }),
  );
}
