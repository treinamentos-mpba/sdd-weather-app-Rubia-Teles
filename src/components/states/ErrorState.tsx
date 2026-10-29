import { RefreshCw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}

export default function ErrorState({ message, onRetry, disabled = false }: ErrorStateProps) {
  return (
    <section
      aria-label="Falha na consulta"
      className="flex min-h-80 flex-col items-center justify-center py-12 text-center"
    >
      <WifiOff aria-hidden="true" className="mb-5 size-10 text-rose-300" />
      <div role="alert">
        <h2 className="text-xl font-semibold text-white">Previsão indisponível</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{message}</p>
        {disabled && (
          <p className="mt-2 text-sm text-slate-300">Aguarde a liberação de novas consultas.</p>
        )}
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={disabled}
        className="mt-6 flex min-h-11 items-center gap-2 rounded-md bg-accent-400 px-5 text-sm font-semibold text-night-900 hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw aria-hidden="true" className="size-4" />
        Tentar novamente
      </button>
    </section>
  );
}
