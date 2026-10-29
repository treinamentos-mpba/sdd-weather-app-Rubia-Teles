import { RefreshCw } from 'lucide-react';
import { formatTimestamp } from '../lib/format';
import type { Unit, WeatherData } from '../types/weather';
import CurrentWeather from './CurrentWeather';
import ForecastList from './ForecastList';

interface WeatherResultsProps {
  data: WeatherData;
  unit: Unit;
  partial: boolean;
  stale: boolean;
  needsRefresh: boolean;
  onRefresh: () => void;
}

export default function WeatherResults({
  data,
  unit,
  partial,
  stale,
  needsRefresh,
  onRefresh,
}: WeatherResultsProps) {
  return (
    <div className="weather-reveal">
      {stale && (
        <p className="mt-5 text-sm text-amber-200">
          Estimativa desatualizada. Atualize a previsão.
        </p>
      )}
      {needsRefresh && (
        <p className="mt-5 text-sm text-amber-200">
          A data local mudou. Atualize para obter os novos dias.
        </p>
      )}
      {partial && (
        <p className="mt-5 text-sm text-amber-200">
          Alguns dados estão indisponíveis. Atualize a previsão para tentar novamente.
        </p>
      )}
      <CurrentWeather
        city={data.city}
        current={data.current}
        unit={unit}
        timeZone={data.timeZone}
      />
      <ForecastList days={data.daily} today={data.daily[0].date} unit={unit} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-5 text-xs text-slate-400">
        <p>
          Obtido em {formatTimestamp(data.obtainedAt, data.timeZone)} · {data.timeZone}
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="flex min-h-11 items-center gap-2 rounded-md px-3 text-slate-200 hover:bg-white/5"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Atualizar previsão
        </button>
      </div>
    </div>
  );
}
