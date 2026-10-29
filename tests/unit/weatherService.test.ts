import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockWeatherData } from '../../src/fixtures/weather';
import { fetchWithTimeout } from '../../src/services/http';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import { fixtureNow, forecastResponse, geocodingResponse } from '../fixtures/weatherApi';

const fetchMock = vi.fn<typeof fetch>();
function respond(payload: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(payload), { status }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(fixtureNow);
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('geocoding', () => {
  it('não chama rede para entrada vazia', async () => {
    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('codifica o nome e mapeia a cidade', async () => {
    respond(geocodingResponse);
    const cities = await searchCities(' São Paulo ');
    expect(String(fetchMock.mock.calls[0][0])).toContain('name=S%C3%A3o%20Paulo');
    expect(cities[0]).toEqual({ ...mockWeatherData.city, key: 'open-meteo:3448439' });
  });
  it.each([
    {},
    { results: [] },
    { generationtime_ms: 0.1 },
  ])('reconhece resultado vazio válido', async (payload) => {
    respond(payload);
    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });
  it('não transforma payload malformado em vazio', async () => {
    for (const payload of [null, [], { results: null }, { results: 'inválido' }]) {
      respond(payload);
      await expect(searchCities('Cidade')).rejects.toBeInstanceOf(WeatherServiceError);
    }
  });
  it('rejeita HTTP não-ok e libera o timer', async () => {
    respond({ reason: 'Falha' }, 503);
    await expect(searchCities('Cidade')).rejects.toMatchObject({ kind: 'http', status: 503 });
    expect(vi.getTimerCount()).toBe(0);
  });
  it('descarta cidades inválidas e preserva a ordem com limite de dez', async () => {
    const city = geocodingResponse.results[0];
    respond({
      results: [
        null,
        { ...city, latitude: 91 },
        { ...city, name: '' },
        ...Array.from({ length: 12 }, (_, index) => ({ ...city, id: index + 10 })),
      ],
    });
    const cities = await searchCities('Cidade');
    expect(cities).toHaveLength(10);
    expect(cities[0].key).toBe('open-meteo:10');
    expect(cities[9].key).toBe('open-meteo:19');
    respond({ results: [{ ...city, longitude: 181 }] });
    await expect(searchCities('Cidade')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('forecast', () => {
  it.each(['null', 'omitted'])('protege todos os campos opcionais quando %s', async (mode) => {
    const payload = structuredClone(forecastResponse);
    const current: Record<string, unknown> = payload.current;
    for (const field of [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'surface_pressure',
      'weather_code',
    ]) {
      if (mode === 'null') current[field] = null;
      else delete current[field];
    }
    const daily: Record<string, unknown> = payload.daily;
    if (mode === 'null') daily.precipitation_probability_max = Array(5).fill(null);
    else delete daily.precipitation_probability_max;
    respond(payload);
    const data = await getWeather(mockWeatherData.city);
    expect(data.current).toMatchObject({
      temperatureC: null,
      humidityPercent: null,
      windSpeedKmh: null,
      pressureHpa: null,
      conditionCode: null,
    });
    expect(data.daily.every((day) => day.precipitationProbabilityPercent === null)).toBe(true);
    expect(JSON.stringify(data)).not.toMatch(/NaN|undefined/);
  });
  it('normaliza códigos desconhecidos e unidades ausentes como indisponíveis', async () => {
    const payload = structuredClone(forecastResponse);
    payload.current.weather_code = 999;
    payload.daily.weather_code[0] = 999;
    respond(payload);
    const data = await getWeather(mockWeatherData.city);
    expect(data.current?.conditionCode).toBeNull();
    expect(data.daily[0].conditionCode).toBeNull();
    respond({ ...forecastResponse, current_units: {}, daily_units: {} });
    await expect(getWeather(mockWeatherData.city)).rejects.toThrow('não contém dados utilizáveis');
  });
  it('mapeia atual e cinco datas com parâmetros completos', async () => {
    respond(forecastResponse);
    const data = await getWeather(mockWeatherData.city);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('current')).toContain('relative_humidity_2m');
    expect(url.searchParams.get('daily')).toContain('precipitation_probability_max');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
    expect(data.current).toEqual(mockWeatherData.current);
    expect(data.daily).toEqual(mockWeatherData.daily);
    expect(data.obtainedAt).toBe(fixtureNow);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(['current', 'daily'])('rejeita ausência de %s', async (field) => {
    const payload: Record<string, unknown> = structuredClone(forecastResponse);
    delete payload[field];
    respond(payload);
    await expect(getWeather(mockWeatherData.city)).rejects.toThrow('Resposta incompleta');
  });
  it('preserva associação de datas quando a ordem da fonte muda', async () => {
    const payload = structuredClone(forecastResponse);
    payload.daily.time.reverse();
    payload.daily.temperature_2m_min.reverse();
    payload.daily.temperature_2m_max.reverse();
    payload.daily.weather_code.reverse();
    payload.daily.precipitation_probability_max.reverse();
    respond(payload);
    expect((await getWeather(mockWeatherData.city)).daily).toEqual(mockWeatherData.daily);
  });
  it('mantém cinco posições sem inventar medições parciais', async () => {
    const payload = structuredClone(forecastResponse);
    payload.daily.time = payload.daily.time.slice(0, 2);
    payload.daily.temperature_2m_min[0] = null;
    respond(payload);
    const data = await getWeather(mockWeatherData.city);
    expect(data.daily).toHaveLength(5);
    expect(data.daily[0].minimumC).toBeNull();
    expect(data.daily[2].maximumC).toBeNull();
    expect(data.current?.precipitationMm).toBe(0);
  });
  it('normaliza precipitação explicitamente nula para zero, sem inventar outros campos', async () => {
    respond({
      ...forecastResponse,
      current: { ...forecastResponse.current, precipitation: null, relative_humidity_2m: null },
    });
    const data = await getWeather(mockWeatherData.city);
    expect(data.current?.precipitationMm).toBe(0);
    expect(data.current?.humidityPercent).toBeNull();
    const { precipitation: _omitted, ...current } = forecastResponse.current;
    respond({ ...forecastResponse, current });
    expect((await getWeather(mockWeatherData.city)).current?.precipitationMm).toBeNull();
  });
  it('rejeita fuso inválido e não identifica Fahrenheit como Celsius', async () => {
    respond({ ...forecastResponse, timezone: 'Invalid/Zone' });
    await expect(getWeather(mockWeatherData.city)).rejects.toThrow('Fuso horário inválido');
    const payload = structuredClone(forecastResponse);
    payload.current_units.temperature_2m = '°F';
    respond(payload);
    expect((await getWeather(mockWeatherData.city)).current?.temperatureC).toBeNull();
  });
  it.each([400, 429, 503])('propaga HTTP %s do forecast como erro tipado', async (status) => {
    respond({ reason: 'Falha controlada' }, status);
    await expect(getWeather(mockWeatherData.city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
      status,
    });
    expect(vi.getTimerCount()).toBe(0);
  });
  it('não chama forecast com coordenadas inválidas', async () => {
    await expect(getWeather({ ...mockWeatherData.city, latitude: Number.NaN })).rejects.toThrow(
      'Coordenadas',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('invalida data duplicada sem copiar suas medições para outro dia', async () => {
    const payload = structuredClone(forecastResponse);
    payload.daily.time[1] = payload.daily.time[0];
    respond(payload);
    const data = await getWeather(mockWeatherData.city);
    expect(data.daily).toHaveLength(5);
    expect(data.daily[0].maximumC).toBeNull();
    expect(data.daily[1].maximumC).toBeNull();
    expect(data.daily[2].maximumC).toBe(mockWeatherData.daily[2].maximumC);
  });
  it('não desloca arrays curtos e invalida mínima maior que máxima', async () => {
    const payload = structuredClone(forecastResponse);
    payload.daily.temperature_2m_min = [50];
    respond(payload);
    const data = await getWeather(mockWeatherData.city);
    expect(data.daily[0].minimumC).toBeNull();
    expect(data.daily[0].maximumC).toBeNull();
    expect(data.daily[1].minimumC).toBeNull();
    expect(data.daily[1].maximumC).toBe(mockWeatherData.daily[1].maximumC);
    expect(data.daily[0].conditionCode).toBe(mockWeatherData.daily[0].conditionCode);
  });
  it('aceita referência no limite de cinco minutos e invalida acima dele', async () => {
    respond({
      ...forecastResponse,
      current: { ...forecastResponse.current, time: fixtureNow / 1000 + 300 },
    });
    expect((await getWeather(mockWeatherData.city)).current).not.toBeNull();
    respond({
      ...forecastResponse,
      current: { ...forecastResponse.current, time: fixtureNow / 1000 + 301 },
    });
    expect((await getWeather(mockWeatherData.city)).current).toBeNull();
  });
  it('rejeita resposta presente mas sem qualquer campo utilizável', async () => {
    respond({ ...forecastResponse, current: {}, daily: { time: [] } });
    await expect(getWeather(mockWeatherData.city)).rejects.toThrow('não contém dados utilizáveis');
  });
  it('projeta o ano novo no fuso da cidade, não no fuso UTC', async () => {
    vi.setSystemTime(new Date('2027-01-01T01:00:00Z'));
    respond(forecastResponse);
    const data = await getWeather(mockWeatherData.city);
    expect(data.daily.map((day) => day.date)).toEqual([
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
      '2027-01-04',
    ]);
    expect(data.daily.every((day) => day.maximumC === null)).toBe(true);
  });
});

describe('transporte e erros', () => {
  it('encerra timeout mesmo quando a leitura JSON não coopera com abort', async () => {
    const response = new Response('{}');
    vi.spyOn(response, 'json').mockImplementation(() => new Promise(() => {}));
    fetchMock.mockResolvedValueOnce(response);
    const request = fetchWithTimeout('https://api.open-meteo.com');
    const assertion = expect(request).rejects.toMatchObject({
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
  it('não inicia fetch com sinal previamente cancelado', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchWithTimeout('https://api.open-meteo.com', controller.signal),
    ).rejects.toMatchObject({ kind: 'timeout' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([
    'seconds',
    'date',
  ])('respeita cooldown por origem com Retry-After em %s', async (mode) => {
    const header = mode === 'seconds' ? '60' : new Date(fixtureNow + 60_000).toUTCString();
    fetchMock.mockResolvedValueOnce(
      new Response('{}', { status: 429, headers: { 'Retry-After': header } }),
    );
    await expect(getWeather(mockWeatherData.city)).rejects.toMatchObject({
      status: 429,
      retryAt: fixtureNow + 60_000,
    });
    await expect(getWeather(mockWeatherData.city)).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledOnce();
    respond(geocodingResponse);
    await expect(searchCities('São Paulo')).resolves.toHaveLength(1);
    await vi.advanceTimersByTimeAsync(60_000);
    respond(forecastResponse);
    await expect(getWeather(mockWeatherData.city)).resolves.toHaveProperty('daily');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it.each([
    'inválido',
    '-1',
    '',
    '60.5',
    'Infinity',
  ])('não bloqueia retry com Retry-After %s', async (header) => {
    fetchMock.mockResolvedValueOnce(
      new Response('{}', { status: 429, headers: { 'Retry-After': header } }),
    );
    await expect(getWeather(mockWeatherData.city)).rejects.toMatchObject({
      status: 429,
      retryAt: null,
    });
    respond(forecastResponse);
    await expect(getWeather(mockWeatherData.city)).resolves.toHaveProperty('daily');
  });
  it('normaliza falhas de rede e limpa o timer', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(fetchWithTimeout('https://api.open-meteo.com')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Falha de rede.',
    });
    expect(vi.getTimerCount()).toBe(0);
  });
  it('aborta em dez segundos e normaliza AbortError', async () => {
    let requestSignal: AbortSignal | undefined;
    fetchMock.mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          requestSignal = options?.signal ?? undefined;
          requestSignal?.addEventListener('abort', () =>
            reject(new DOMException('Timeout', 'AbortError')),
          );
        }),
    );
    const request = fetchWithTimeout('https://api.open-meteo.com');
    const assertion = expect(request).rejects.toMatchObject({
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(9999);
    expect(requestSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(requestSignal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('converte AbortError imediato e JSON inválido em erros tipados', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    await expect(searchCities('Cidade')).rejects.toThrow('A requisição demorou demais.');
    fetchMock.mockResolvedValueOnce(new Response('não é JSON'));
    await expect(searchCities('Cidade')).rejects.toMatchObject({ kind: 'invalid-data' });
    expect(vi.getTimerCount()).toBe(0);
  });
});
