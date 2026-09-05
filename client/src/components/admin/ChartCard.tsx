import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyLabel?: string;
  children: React.ReactNode;
  height?: number;
}

export const ChartCard = ({
  title,
  description,
  loading,
  error,
  onRetry,
  isEmpty,
  emptyLabel = 'No data yet',
  children,
  height = 260,
}: ChartCardProps) => (
  <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {loading ? (
      <Skeleton className="w-full" style={{ height }} />
    ) : error ? (
      <ErrorState className="border-0 bg-transparent" onRetry={onRetry} />
    ) : isEmpty ? (
      <EmptyState title={emptyLabel} className="border-0 bg-transparent py-8" />
    ) : (
      <div style={{ height }}>{children}</div>
    )}
  </section>
);
