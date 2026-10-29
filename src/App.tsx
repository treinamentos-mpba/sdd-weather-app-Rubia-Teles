import { CloudSun } from 'lucide-react';
import { useState } from 'react';
import CityResults from './components/CityResults';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import WeatherResults from './components/WeatherResults';
import useResultFocus from './hooks/useResultFocus';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const {
    status,
    data,
    cities,
    error,
    query,
    partial,
    stale,
    needsRefresh,
    retryDisabled,
    search,
    selectCity,
    retry,
  } = useWeather();
  const resultRef = useResultFocus(status, query);
  const announcement =
    status === 'loading'
      ? 'Carregando previsão.'
      : status === 'empty'
        ? 'Nenhuma cidade encontrada.'
        : status === 'success' && data
          ? `Previsão de ${data.city.name} ${partial ? 'parcialmente disponível' : 'carregada'}.${stale ? ' Estimativa desatualizada.' : ''}${needsRefresh ? ' Atualização necessária.' : ''}`
          : '';

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="border-b border-white/10 bg-night-900/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl items-center gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
          <a
            href="#main-content"
            className="flex w-fit items-center gap-3 rounded-sm text-white"
            aria-label="Horizonte, previsão do tempo"
          >
            <CloudSun aria-hidden="true" className="size-9 text-sun" strokeWidth={1.5} />
            <span className="text-xl font-semibold">
              horizonte<span className="text-emerald-300">.</span>
            </span>
          </a>
          <div className="min-w-0 lg:justify-self-stretch">
            <SearchBar onSearch={search} pendingQuery={status === 'loading' ? query : undefined} />
          </div>
          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <span className="text-xs text-slate-400 lg:hidden">Temperatura</span>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>
      <p role="status" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      <main
        ref={resultRef}
        id="main-content"
        tabIndex={-1}
        aria-busy={status === 'loading'}
        className="mx-auto max-w-6xl px-5 pb-6 sm:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 py-5">
          <p className="text-xs text-slate-300">Clima atual e próximos 5 dias</p>
          <a
            href="https://open-meteo.com/"
            className="rounded-sm text-xs text-emerald-200 underline underline-offset-4"
          >
            Dados Open-Meteo
          </a>
        </div>
        {cities.length > 1 && (
          <CityResults cities={cities} selectedKey={data?.city.key} onSelect={selectCity} />
        )}
        {status === 'loading' && <LoadingState announce={false} />}
        {status === 'error' && (
          <ErrorState
            message={error ?? 'Não foi possível carregar a previsão.'}
            onRetry={retry}
            disabled={retryDisabled}
          />
        )}
        {status === 'empty' && (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não encontramos correspondências para “${query}”.`}
            announce={false}
          />
        )}
        {status === 'idle' && (
          <EmptyState
            title="Qual é o seu próximo destino?"
            hint="Informe uma cidade para consultar o clima atual e a previsão."
            announce={false}
          />
        )}
        {data && (
          <div>
            {status !== 'success' && (
              <p className="mt-5 text-sm text-slate-300">Última consulta concluída</p>
            )}
            <WeatherResults
              data={data}
              unit={unit}
              partial={partial}
              stale={stale}
              needsRefresh={needsRefresh}
              onRefresh={() => selectCity(data.city)}
            />
          </div>
        )}
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 pb-8 pt-5 text-xs text-slate-400 sm:px-8">
        <span>horizonte. / previsão do tempo</span>
        <a href="https://www.geonames.org/" className="rounded-sm underline underline-offset-4">
          Localidades: GeoNames
        </a>
      </footer>
    </div>
  );
}
