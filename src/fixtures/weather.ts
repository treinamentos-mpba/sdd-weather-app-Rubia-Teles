import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    key: 'mock-sao-paulo',
    name: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
  },
  timeZone: 'America/Sao_Paulo',
  obtainedAt: Date.parse('2026-10-29T15:05:00Z'),
  current: {
    referenceAt: Date.parse('2026-10-29T15:00:00Z'),
    temperatureC: 24.5,
    conditionCode: 2,
    humidityPercent: 64,
    windSpeedKmh: 12.4,
    precipitationMm: 0,
    pressureHpa: 1014,
  },
  daily: [
    {
      date: '2026-10-29',
      minimumC: 18.2,
      maximumC: 27.1,
      conditionCode: 2,
      precipitationProbabilityPercent: 15,
    },
    {
      date: '2026-10-30',
      minimumC: 19.1,
      maximumC: 28.4,
      conditionCode: 0,
      precipitationProbabilityPercent: 5,
    },
    {
      date: '2026-10-31',
      minimumC: 18.5,
      maximumC: 25.3,
      conditionCode: 61,
      precipitationProbabilityPercent: 80,
    },
    {
      date: '2026-11-01',
      minimumC: 17.3,
      maximumC: 23.8,
      conditionCode: 3,
      precipitationProbabilityPercent: 35,
    },
    {
      date: '2026-11-02',
      minimumC: 18.4,
      maximumC: 26.2,
      conditionCode: 1,
      precipitationProbabilityPercent: 10,
    },
  ],
};

export const sampleCities: readonly WeatherData[] = [
  mockWeatherData,
  {
    ...mockWeatherData,
    city: {
      key: 'mock-lisboa',
      name: 'Lisboa',
      region: 'Lisboa',
      country: 'Portugal',
      latitude: 38.72,
      longitude: -9.14,
    },
    timeZone: 'Europe/Lisbon',
    current: { ...mockWeatherData.current!, temperatureC: 19.2, conditionCode: 0 },
  },
  {
    ...mockWeatherData,
    city: {
      key: 'mock-curitiba',
      name: 'Curitiba',
      region: 'Paraná',
      country: 'Brasil',
      latitude: -25.43,
      longitude: -49.27,
    },
    current: {
      ...mockWeatherData.current!,
      temperatureC: 16.8,
      conditionCode: 61,
      precipitationMm: 1.2,
    },
  },
];
