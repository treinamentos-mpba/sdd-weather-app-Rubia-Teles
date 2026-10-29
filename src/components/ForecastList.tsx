import { CalendarDays } from 'lucide-react';
import type { ForecastDay, LocalDate, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: readonly ForecastDay[];
  today: LocalDate;
  unit: Unit;
}

export default function ForecastList({ days, today, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="py-8 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="forecast-heading"
          className="flex items-center gap-2 text-lg font-semibold text-white"
        >
          <CalendarDays aria-hidden="true" className="size-5 text-slate-400" />
          Previsão de 5 dias
        </h2>
        <p className="text-xs text-slate-400">Hoje + 4 dias</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {days.map((day) => (
          <ForecastCard key={day.date} day={day} today={today} unit={unit} />
        ))}
      </ul>
    </section>
  );
}
