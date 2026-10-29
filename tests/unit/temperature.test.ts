import { describe, expect, it } from 'vitest';
import { mockWeatherData } from '../../src/fixtures/weather';
import {
  convertTemperature,
  formatTemperature,
  formatTemperatureValue,
  unitLabel,
} from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [20, 68],
  ])('%s °C → %s °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });
  it.each([0, 100, -40, 0.25])('mantém %s em Celsius', (value) => {
    expect(convertTemperature(value, 'celsius')).toBe(value);
  });
  it('deriva repetidamente sem mutar o domínio', () => {
    const before = structuredClone(mockWeatherData);
    for (let iteration = 0; iteration < 10; iteration += 1) {
      formatTemperature(mockWeatherData.current?.temperatureC ?? null, 'fahrenheit');
      formatTemperature(mockWeatherData.current?.temperatureC ?? null, 'celsius');
    }
    expect(mockWeatherData).toEqual(before);
  });
});

describe('formatTemperature e unitLabel', () => {
  it.each([
    [0, 'fahrenheit', '32,0 °F'],
    [100, 'fahrenheit', '212,0 °F'],
    [-40, 'fahrenheit', '-40,0 °F'],
    [24.56, 'celsius', '24,6 °C'],
    [0.25, 'celsius', '0,3 °C'],
    [-0.25, 'celsius', '-0,3 °C'],
    [-0.01, 'celsius', '0,0 °C'],
    [null, 'celsius', 'Indisponível'],
    [Number.NaN, 'fahrenheit', 'Indisponível'],
    [Number.POSITIVE_INFINITY, 'celsius', 'Indisponível'],
  ] as const)('formata %s em %s', (value, unit, expected) => {
    expect(formatTemperature(value, unit)).toBe(expected);
  });
  it('separa valor numérico e símbolo da unidade', () => {
    expect(formatTemperatureValue(0, 'fahrenheit')).toBe('32,0');
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
