import { Droplets } from 'lucide-react';
import { formatDate, formatDay, formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherAppearance } from '../lib/weatherCodes';
import type { ForecastDay, LocalDate, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  today: LocalDate;
  unit: Unit;
}

export default function ForecastCard({ day, today, unit }: ForecastCardProps) {
  const { Icon, label } = getWeatherAppearance(day.conditionCode);
  return (
    <li className="flex min-w-0 flex-col rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:border-white/25 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h3
          className={`text-sm font-semibold capitalize ${day.date === today ? 'text-emerald-300' : 'text-white'}`}
        >
          {formatDay(day.date, today)}
        </h3>
        <time dateTime={day.date} className="text-xs text-slate-400">
          {formatDate(day.date)}
        </time>
      </div>
      <Icon aria-hidden="true" strokeWidth={1.4} className="my-5 size-10 text-sun" />
      <p className="min-h-10 text-xs leading-5 text-slate-300">{label}</p>
      <dl className="mt-4 space-y-2 text-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <dt className="text-slate-400">Máx.</dt>
          <dd className="font-semibold text-white">{formatTemperature(day.maximumC, unit)}</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <dt className="text-slate-400">Mín.</dt>
          <dd className="text-slate-300">{formatTemperature(day.minimumC, unit)}</dd>
        </div>
      </dl>
      <div
        role="group"
        className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-cyan-200"
        aria-label={`Probabilidade de chuva: ${formatMetric(day.precipitationProbabilityPercent, '%')}`}
      >
        <Droplets aria-hidden="true" className="size-3.5 shrink-0" />
        {formatMetric(day.precipitationProbabilityPercent, '%')}
      </div>
    </li>
  );
}
