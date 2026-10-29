import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex shrink-0 gap-1 rounded-lg border border-white/20 bg-white/5 p-1 backdrop-blur-md"
    >
      {(['celsius', 'fahrenheit'] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-label={option === 'celsius' ? 'Celsius' : 'Fahrenheit'}
          aria-pressed={unit === option}
          onClick={() => onChange(option)}
          className={`min-h-11 min-w-11 rounded-md px-3 text-sm font-semibold transition-colors ${unit === option ? 'bg-white text-night-900' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          {option === 'celsius' ? '°C' : '°F'}
        </button>
      ))}
    </div>
  );
}
