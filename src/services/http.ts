import { WeatherServiceError } from './weatherServiceError';

const cooldowns = new Map<string, number>();

function retryDeadline(header: string | null): number | null {
  if (!header?.trim()) return null;
  const value = header.trim();
  const seconds = /^\d+$/.test(value);
  const httpDate =
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/;
  if (!seconds && !httpDate.test(value)) return null;
  const deadline = seconds ? Date.now() + Number(value) * 1000 : Date.parse(value);
  return Number.isFinite(deadline) && deadline > Date.now() && deadline <= 8.64e15
    ? deadline
    : null;
}

async function readResponse(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, credentials: 'omit', cache: 'no-store' });
  if (!response.ok) {
    const retryAt =
      response.status === 429 ? retryDeadline(response.headers.get('Retry-After')) : null;
    if (retryAt) cooldowns.set(new URL(url).origin, retryAt);
    throw new WeatherServiceError(
      response.status === 429
        ? 'Limite de consultas atingido. Aguarde para tentar novamente.'
        : `Não foi possível consultar os dados (HTTP ${response.status}).`,
      'http',
      response.status,
      retryAt,
    );
  }
  return response.json();
}

export async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<unknown> {
  const origin = new URL(url).origin;
  const retryAt = cooldowns.get(origin) ?? 0;
  if (retryAt > Date.now()) {
    throw new WeatherServiceError(
      'Limite de consultas atingido. Aguarde para tentar novamente.',
      'http',
      429,
      retryAt,
    );
  }
  cooldowns.delete(origin);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  const timeout = setTimeout(cancel, 10_000);
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  let onAbort: (() => void) | undefined;

  try {
    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const aborted = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
      controller.signal.addEventListener('abort', onAbort, { once: true });
    });
    return await Promise.race([readResponse(url, controller.signal), aborted]);
  } catch (error) {
    const errorName =
      typeof error === 'object' && error !== null && 'name' in error ? error.name : null;
    if (controller.signal.aborted || errorName === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.', 'timeout');
    }
    if (error instanceof WeatherServiceError) throw error;
    if (errorName === 'SyntaxError') {
      throw new WeatherServiceError('Resposta inválida do serviço de clima.', 'invalid-data');
    }
    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
    if (onAbort) controller.signal.removeEventListener('abort', onAbort);
  }
}
