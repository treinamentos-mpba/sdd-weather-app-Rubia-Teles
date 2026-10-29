import { useEffect, useRef } from 'react';
import type { ViewStatus } from '../types/weather';

export default function useResultFocus(status: ViewStatus, query: string) {
  const resultRef = useRef<HTMLElement>(null);
  const previous = useRef<ViewStatus>('idle');
  useEffect(() => {
    const finishedSearch =
      previous.current === 'loading' && (status === 'success' || status === 'empty');
    previous.current = status;
    if (!finishedSearch) return;
    const active = document.activeElement;
    const form = active instanceof HTMLElement ? active.closest('[role="search"]') : null;
    const input = form?.querySelector<HTMLInputElement>('input[type="search"]');
    if (!input || input.value.trim() !== query) return;
    const heading = resultRef.current?.querySelector<HTMLElement>('h1, h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [status, query]);
  return resultRef;
}
