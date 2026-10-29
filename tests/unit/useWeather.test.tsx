import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockWeatherData } from '../../src/fixtures/weather';
import useWeather from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const searchMock = vi.mocked(searchCities);
const forecastMock = vi.mocked(getWeather);
const city = mockWeatherData.city;

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Value>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  searchMock.mockResolvedValue([city]);
  forecastMock.mockResolvedValue(mockWeatherData);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('preserva a última consulta quando uma nova busca de cidades falha', async () => {
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    searchMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'));
    await act(() => result.current.search('Outra cidade'));
    expect(result.current.status).toBe('error');
    expect(result.current.data?.city.key).toBe(city.key);
    expect(result.current.query).toBe('Outra cidade');
    expect(result.current.error).toBe('Falha de rede.');
  });
  it('reavalia frescor e virada sem nova chamada à API', async () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.setSystemTime(mockWeatherData.current!.referenceAt + 7_200_000);
    const { result, unmount } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    expect(result.current.stale).toBe(false);
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(result.current.stale).toBe(true);
    vi.setSystemTime(new Date('2026-10-30T03:00:00Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.data?.daily[0].date).toBe('2026-10-30');
    expect(result.current.needsRefresh).toBe(true);
    expect(searchMock).toHaveBeenCalledOnce();
    expect(forecastMock).toHaveBeenCalledOnce();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('suspende relógio oculto e reavalia ao voltar', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(mockWeatherData.obtainedAt);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    const { result, unmount } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    visibility.mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(vi.getTimerCount()).toBe(0);
    vi.setSystemTime(new Date('2026-10-30T03:00:00Z'));
    visibility.mockReturnValue('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.needsRefresh).toBe(true);
    expect(forecastMock).toHaveBeenCalledOnce();
    unmount();
  });
  it('libera retry no fim do cooldown sem chamar a rede automaticamente', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(mockWeatherData.obtainedAt);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    forecastMock.mockRejectedValueOnce(
      new WeatherServiceError('Limite temporário.', 'http', 429, Date.now() + 60_000),
    );
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    expect(result.current.retryDisabled).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(result.current.retryDisabled).toBe(false);
    expect(forecastMock).toHaveBeenCalledOnce();
    await act(() => result.current.retry());
    expect(result.current.status).toBe('success');
    expect(searchMock).toHaveBeenCalledOnce();
    expect(forecastMock).toHaveBeenCalledTimes(2);
  });
  it('inicia idle sem request e ignora busca vazia', async () => {
    const { result } = renderHook(useWeather);
    expect(result.current.status).toBe('idle');
    await act(() => result.current.search('   '));
    expect(result.current.data).toBeNull();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('carrega automaticamente a primeira cidade e expõe as alternativas', async () => {
    const alternative = { ...city, key: 'other', country: 'Outro país' };
    searchMock.mockResolvedValueOnce([city, alternative]);
    const { result } = renderHook(useWeather);
    await act(() => result.current.search(' São Paulo '));
    expect(result.current.status).toBe('success');
    expect(result.current.query).toBe('São Paulo');
    expect(result.current.cities).toEqual([city, alternative]);
    expect(forecastMock).toHaveBeenCalledWith(city, expect.any(AbortSignal));
    expect(result.current.data).toEqual(mockWeatherData);
  });

  it('encerra empty sem buscar previsão', async () => {
    searchMock.mockResolvedValueOnce([]);
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('Sem resultados'));
    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(forecastMock).not.toHaveBeenCalled();
  });

  it('retry de geocoding repete a busca que falhou', async () => {
    searchMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'));
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    expect(result.current.error).toBe('Falha de rede.');
    await act(() => result.current.retry());
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('retry de forecast não refaz geocoding', async () => {
    forecastMock.mockRejectedValueOnce(new WeatherServiceError('Resposta incompleta da previsão.'));
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    expect(result.current.status).toBe('error');
    expect(result.current.data).toBeNull();
    await act(() => result.current.retry());
    expect(searchMock).toHaveBeenCalledOnce();
    expect(forecastMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('selectCity consulta a alternativa sem nova busca', async () => {
    const selected = { ...city, key: 'selected', name: 'Outra cidade' };
    const { result } = renderHook(useWeather);
    await act(() => result.current.search('São Paulo'));
    forecastMock.mockResolvedValueOnce({ ...mockWeatherData, city: selected });
    await act(() => result.current.selectCity(selected));
    expect(result.current.data?.city).toEqual(selected);
    expect(searchMock).toHaveBeenCalledOnce();
  });

  it('ignora respostas de busca substituída e seu erro tardio', async () => {
    const old = deferred<City[]>();
    searchMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    act(() => {
      first = result.current.search('Antiga');
    });
    expect(result.current.status).toBe('loading');
    await act(() => result.current.search('Nova'));
    await act(async () => {
      old.reject(new WeatherServiceError('Falha antiga'));
      await first;
    });
    expect(result.current.status).toBe('success');
    expect(result.current.query).toBe('Nova');
    expect(forecastMock).toHaveBeenCalledOnce();
  });

  it('ignora forecast antigo e impede duplicata pendente', async () => {
    const old = deferred<WeatherData>();
    forecastMock.mockReturnValueOnce(old.promise);
    const { result } = renderHook(useWeather);
    let first!: Promise<void>;
    await act(async () => {
      first = result.current.search('São Paulo');
      await Promise.resolve();
    });
    await act(() => result.current.search('São Paulo'));
    expect(searchMock).toHaveBeenCalledOnce();
    const newer = { ...city, name: 'Nova', key: 'newer' };
    forecastMock.mockResolvedValueOnce({ ...mockWeatherData, city: newer });
    await act(() => result.current.selectCity(newer));
    await act(async () => {
      old.resolve(mockWeatherData);
      await first;
    });
    expect(result.current.data?.city.name).toBe('Nova');
  });

  it('cancela requisição ao desmontar', async () => {
    const pending = deferred<City[]>();
    searchMock.mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(useWeather);
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('São Paulo');
    });
    const signal = searchMock.mock.calls[0][1];
    unmount();
    expect(signal?.aborted).toBe(true);
    pending.resolve([city]);
    await request;
    expect(forecastMock).not.toHaveBeenCalled();
  });
});
