import { MapPin } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  hint: string;
  announce?: boolean;
}

export default function EmptyState({ title, hint, announce = true }: EmptyStateProps) {
  return (
    <div
      role={announce ? 'status' : undefined}
      className="flex min-h-80 flex-col items-center justify-center py-12 text-center"
    >
      <MapPin aria-hidden="true" className="mb-5 size-10 text-emerald-300" />
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{hint}</p>
    </div>
  );
}
