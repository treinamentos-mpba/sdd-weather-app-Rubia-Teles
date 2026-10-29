import { Search } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  pendingQuery?: string;
}

export default function SearchBar({ onSearch, disabled = false, pendingQuery }: SearchBarProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const duplicate = pendingQuery !== undefined && query.trim() === pendingQuery;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || duplicate) return;
    const city = query.trim();
    if (Array.from(city).length < 2 || Array.from(city).length > 100) {
      setError('Informe uma cidade com 2 a 100 caracteres.');
      return;
    }
    setError('');
    onSearch(city);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      aria-busy={pendingQuery !== undefined}
      onSubmit={submit}
      className="w-full min-w-0"
    >
      <label htmlFor={inputId} className="sr-only">
        Cidade
      </label>
      <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-500 bg-white/5 p-1.5 backdrop-blur-md focus-within:border-accent-400">
        <Search
          aria-hidden="true"
          className="ml-2 hidden size-5 shrink-0 text-slate-400 sm:block"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError('');
          }}
          placeholder="Buscar cidade"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-11 w-full min-w-0 rounded bg-transparent px-2 text-sm text-white placeholder:text-slate-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          aria-disabled={duplicate || disabled}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-md bg-accent-400 px-3 text-sm font-semibold text-night-900 transition-colors hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-wait aria-disabled:opacity-50 sm:px-4"
        >
          <Search aria-hidden="true" className="size-4 sm:hidden" />
          Buscar
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-rose-200">
          {error}
        </p>
      )}
    </form>
  );
}
