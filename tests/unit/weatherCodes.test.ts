import { describe, expect, it } from 'vitest';
import { getWeatherAppearance } from '../../src/lib/weatherCodes';

describe('códigos WMO', () => {
  it.each([
    [0, 'Céu limpo'],
    [1, 'Predominantemente limpo'],
    [2, 'Parcialmente nublado'],
    [3, 'Encoberto'],
    [45, 'Nevoeiro'],
    [48, 'Nevoeiro'],
    [51, 'Garoa'],
    [53, 'Garoa'],
    [55, 'Garoa'],
    [56, 'Garoa congelante'],
    [57, 'Garoa congelante'],
    [61, 'Chuva'],
    [63, 'Chuva'],
    [65, 'Chuva'],
    [66, 'Chuva congelante'],
    [67, 'Chuva congelante'],
    [71, 'Neve'],
    [73, 'Neve'],
    [75, 'Neve'],
    [77, 'Neve'],
    [80, 'Pancadas de chuva'],
    [81, 'Pancadas de chuva'],
    [82, 'Pancadas de chuva'],
    [85, 'Pancadas de neve'],
    [86, 'Pancadas de neve'],
    [95, 'Trovoadas'],
    [96, 'Trovoadas com granizo'],
    [99, 'Trovoadas com granizo'],
  ])('mapeia código %s', (code, expected) => {
    const appearance = getWeatherAppearance(Number(code));
    expect(appearance.label).toBe(expected);
    expect(appearance.Icon).toBeDefined();
  });
  it.each([
    null,
    -1,
    999,
    2.5,
    Number.NaN,
  ])('usa fallback para %s sem presumir céu limpo', (code) => {
    const appearance = getWeatherAppearance(code);
    expect(appearance.label).toBe('Condição indisponível');
    expect(appearance.Icon).toBeDefined();
  });
});
