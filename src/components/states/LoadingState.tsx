import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ announce = true }: { announce?: boolean }) {
  return (
    <div
      role={announce ? 'status' : undefined}
      className="flex min-h-80 flex-col items-center justify-center gap-5 py-12 text-center"
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-10 animate-spin text-accent-400 motion-reduce:animate-none"
      />
      <p className="text-lg font-medium text-white">Carregando previsão…</p>
      <p className="text-sm text-slate-400">Consultando Open-Meteo</p>
    </div>
  );
}
