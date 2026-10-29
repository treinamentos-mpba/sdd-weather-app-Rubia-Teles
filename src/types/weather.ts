export type Unit = 'celsius' | 'fahrenheit';
export type LocalDate = string;
export type InstantMs = number;

export interface City {
  key: string;
  name: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  referenceAt: InstantMs;
  temperatureC: number | null;
  conditionCode: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  pressureHpa: number | null;
}

export interface ForecastDay {
  date: LocalDate;
  minimumC: number | null;
  maximumC: number | null;
  conditionCode: number | null;
  precipitationProbabilityPercent: number | null;
}

export interface WeatherData {
  city: City;
  timeZone: string;
  obtainedAt: InstantMs;
  current: CurrentWeather | null;
  daily: readonly ForecastDay[];
}

export type ViewStatus = 'idle' | 'loading' | 'empty' | 'error' | 'success';
