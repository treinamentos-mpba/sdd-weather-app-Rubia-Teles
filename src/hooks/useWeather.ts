import { useEffect, useRef, useState } from 'react';
import { projectWeather } from '../lib/weather';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, ViewStatus, WeatherData } from '../types/weather';
import useWeatherClock from './useWeatherClock';

interface WeatherState {
  status: ViewStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  retryAt: number | null;
}

type Operation = { kind: 'search'; name: string } | { kind: 'forecast'; city: City };
const initialState: WeatherState = {
  status: 'idle',
  data: null,
  cities: [],
  error: null,
  query: '',
  retryAt: null,
};

export default function useWeather() {
  const [state, setState] = useState<WeatherState>(initialState);
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const lastOperation = useRef<Operation | null>(null);
  const pendingKey = useRef<string | null>(null);
  const now = useWeatherClock(state.data, state.retryAt);
  const projection = state.data ? projectWeather(state.data, now) : null;

  useEffect(
    () => () => {
      sequence.current += 1;
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );

  async function execute(operation: Operation) {
    const key =
      operation.kind === 'search' ? `search:${operation.name}` : `forecast:${operation.city.key}`;
    if (pendingKey.current === key && controller.current) return;
    const identity = ++sequence.current;
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    pendingKey.current = key;
    lastOperation.current = operation;
    setState((previous) => ({
      status: 'loading',
      data: operation.kind === 'search' ? previous.data : null,
      error: null,
      cities: operation.kind === 'search' ? [] : previous.cities,
      query: operation.kind === 'search' ? operation.name : previous.query,
      retryAt: null,
    }));

    try {
      let city: City;
      if (operation.kind === 'search') {
        const cities = await searchCities(operation.name, active.signal);
        if (identity !== sequence.current || active.signal.aborted) return;
        if (!cities.length) {
          setState((previous) => ({
            status: 'empty',
            data: previous.data,
            cities: [],
            error: null,
            query: operation.name,
            retryAt: null,
          }));
          return;
        }
        city = cities[0];
        setState((previous) => ({ ...previous, cities, data: null }));
        lastOperation.current = { kind: 'forecast', city };
      } else {
        city = operation.city;
      }
      const data = await getWeather(city, active.signal);
      if (identity !== sequence.current || active.signal.aborted) return;
      setState((previous) => ({ ...previous, status: 'success', data, error: null }));
    } catch (error) {
      if (identity !== sequence.current || active.signal.aborted) return;
      setState((previous) => ({
        ...previous,
        status: 'error',
        data: previous.data,
        error:
          error instanceof WeatherServiceError
            ? error.message
            : 'Não foi possível carregar a previsão.',
        retryAt: error instanceof WeatherServiceError ? error.retryAt : null,
      }));
    } finally {
      if (identity === sequence.current) {
        controller.current = null;
        pendingKey.current = null;
      }
    }
  }

  function search(name: string) {
    const query = name.trim();
    if (!query) {
      sequence.current += 1;
      controller.current?.abort();
      controller.current = null;
      pendingKey.current = null;
      lastOperation.current = null;
      setState(initialState);
      return Promise.resolve();
    }
    return execute({ kind: 'search', name: query });
  }

  function selectCity(city: City) {
    return execute({ kind: 'forecast', city });
  }
  function retry() {
    return lastOperation.current ? execute(lastOperation.current) : Promise.resolve();
  }

  return {
    ...state,
    data: projection?.data ?? null,
    partial: projection?.partial ?? false,
    stale: projection?.stale ?? false,
    needsRefresh: projection?.needsRefresh ?? false,
    retryDisabled: state.retryAt !== null && now < state.retryAt,
    search,
    selectCity,
    retry,
  };
}
