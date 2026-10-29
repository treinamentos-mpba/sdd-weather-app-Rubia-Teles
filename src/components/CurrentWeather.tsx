import { Droplets, Gauge, MapPin, Umbrella, Wind } from 'lucide-react';
import { formatMetric, formatTimestamp } from '../lib/format';
import { formatTemperature, formatTemperatureValue } from '../lib/temperature';
import { getWeatherAppearance } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData | null;
  unit: Unit;
  timeZone?: string;
}

export default function CurrentWeather({
  city,
  current,
  unit,
  timeZone = 'UTC',
}: CurrentWeatherProps) {
  const { Icon, label } = getWeatherAppearance(current?.conditionCode ?? null);
  const metrics = [
    { title: 'Umidade', value: current?.humidityPercent ?? null, suffix: '%', Icon: Droplets },
    { title: 'Vento', value: current?.windSpeedKmh ?? null, suffix: 'km/h', Icon: Wind },
    {
      title: 'Precipitação',
      value: current?.precipitationMm ?? null,
      suffix: 'mm',
      Icon: Umbrella,
    },
    { title: 'Pressão', value: current?.pressureHpa ?? null, suffix: 'hPa', Icon: Gauge },
  ];

  return (
    <section
      aria-label="Clima atual"
      className="border-b border-white/10 pb-9 pt-8 sm:pb-12 sm:pt-12"
    >
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <MapPin aria-hidden="true" className="size-4 text-emerald-300" />
        <span>{[city.region, city.country].filter(Boolean).join(', ')}</span>
      </div>
      <h1 className="mt-3 break-words text-3xl font-semibold text-white sm:text-4xl">
        {city.name}
      </h1>
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-center gap-4 sm:gap-8">
          <div className="min-w-0">
            <div
              role="group"
              aria-label={formatTemperature(current?.temperatureC ?? null, unit)}
              className="flex flex-wrap items-start gap-1 font-light text-white"
            >
              <span className={current?.temperatureC == null ? 'text-2xl' : 'text-6xl sm:text-8xl'}>
                {formatTemperatureValue(current?.temperatureC ?? null, unit)}
              </span>
              {current?.temperatureC != null && (
                <span aria-hidden="true" className="mt-2 text-2xl text-slate-300 sm:text-3xl">
                  °{unit === 'celsius' ? 'C' : 'F'}
                </span>
              )}
            </div>
            <p className="mt-3 text-base text-slate-200">{label}</p>
          </div>
          <Icon
            aria-hidden="true"
            strokeWidth={1.2}
            className="size-20 shrink-0 text-sun sm:size-32"
          />
        </div>
        <div className="text-sm leading-6 text-slate-400 md:max-w-64 md:text-right">
          <p>Referência da estimativa</p>
          <p className="text-slate-200">
            {current ? formatTimestamp(current.referenceAt, timeZone) : 'Indisponível'}
          </p>
          <p className="break-words">{timeZone}</p>
        </div>
      </div>
      <dl className="mt-9 grid grid-cols-2 gap-x-5 gap-y-7 sm:mt-12 lg:grid-cols-4">
        {metrics.map(({ title, value, suffix, Icon: MetricIcon }) => (
          <div key={title} className="min-w-0 border-l border-white/15 pl-4">
            <dt className="flex items-center gap-2 text-sm text-slate-300">
              <MetricIcon aria-hidden="true" className="size-4 shrink-0 text-emerald-300" />
              {title}
            </dt>
            <dd className="mt-2 break-words text-lg font-medium text-white sm:text-xl">
              {formatMetric(value, suffix)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
