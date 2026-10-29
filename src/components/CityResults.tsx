import { MapPin } from 'lucide-react';
import type { City } from '../types/weather';

interface CityResultsProps {
  cities: readonly City[];
  selectedKey?: string;
  onSelect: (city: City) => void;
}

export default function CityResults({ cities, selectedKey, onSelect }: CityResultsProps) {
  const labels = cities.map((city) =>
    [city.name, city.region, city.country].filter(Boolean).join(', '),
  );
  return (
    <details className="border-b border-white/10">
      <summary className="min-h-11 cursor-pointer py-3 text-sm text-slate-300 marker:text-emerald-300">
        Localidades encontradas ({cities.length})
      </summary>
      <fieldset className="min-w-0 pb-5">
        <legend className="sr-only">Localidades encontradas</legend>
        <div className="flex flex-wrap gap-2">
          {cities.map((city, index) => {
            const label = labels[index];
            const needsCoordinates =
              (!city.region && !city.country) ||
              labels.filter((value) => value === label).length > 1;
            return (
              <button
                key={city.key}
                type="button"
                aria-pressed={selectedKey === city.key}
                onClick={() => onSelect(city)}
                className="flex min-h-11 max-w-full items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 aria-pressed:border-emerald-300"
              >
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-emerald-300" />
                <span className="min-w-0 break-words">
                  {label}
                  {needsCoordinates && ` (${city.latitude}, ${city.longitude})`}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </details>
  );
}
