export type WeatherErrorKind = 'http' | 'network' | 'timeout' | 'invalid-data';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly kind: WeatherErrorKind = 'invalid-data',
    readonly status?: number,
    readonly retryAt: number | null = null,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}
