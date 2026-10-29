import { useEffect, useRef, useState } from 'react';
import { mockWeatherData, sampleCities } from '../fixtures/weather';
import type { ViewStatus } from '../types/weather';

function normalize(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');
}

export default function useMockWeather() {
  const [status, setStatus] = useState<ViewStatus>('success');
  const [data, setData] = useState(mockWeatherData);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuery = useRef(mockWeatherData.city.name);

  function cancel() {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  function search(query: string) {
    cancel();
    lastQuery.current = query;
    setStatus('loading');
    timer.current = setTimeout(() => {
      const match = sampleCities.find((sample) => normalize(sample.city.name) === normalize(query));
      if (match) setData(match);
      setStatus(match ? 'success' : 'empty');
      timer.current = null;
    }, 500);
  }

  function setScenario(next: ViewStatus) {
    cancel();
    setStatus(next);
  }

  return { status, data, search, retry: () => search(lastQuery.current), setScenario };
}
