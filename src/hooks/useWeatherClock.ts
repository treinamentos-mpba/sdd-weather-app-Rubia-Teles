import { useEffect, useState } from 'react';
import { getLocalDate } from '../lib/format';
import type { WeatherData } from '../types/weather';

export default function useWeatherClock(data: WeatherData | null, retryAt: number | null): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!data && !retryAt) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    let previousKey = '';
    function update() {
      const current = Date.now();
      const reference = data?.current?.referenceAt;
      const key = [
        data ? getLocalDate(current, data.timeZone) : '',
        reference != null && current - reference > 7_200_000,
        reference != null && reference > current + 300_000,
        retryAt != null && current < retryAt,
      ].join(':');
      if (key !== previousKey) {
        previousKey = key;
        setNow(current);
      }
      if (!data && retryAt && current >= retryAt) clearInterval(timer);
    }
    function synchronize() {
      clearInterval(timer);
      update();
      if (document.visibilityState !== 'hidden' && (data || (retryAt && Date.now() < retryAt))) {
        timer = setInterval(update, 1000);
      }
    }
    synchronize();
    document.addEventListener('visibilitychange', synchronize);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', synchronize);
    };
  }, [data, retryAt]);
  return Math.max(now, data?.obtainedAt ?? 0);
}
