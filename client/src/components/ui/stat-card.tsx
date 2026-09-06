import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  to?: string;
  hint?: string;
  loading?: boolean;
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

const tones: Record<NonNullable<StatCardProps['tone']>, { chip: string; glow: string }> = {
  primary: { chip: 'bg-primary/10 text-primary', glow: 'from-primary/10' },
  secondary: { chip: 'bg-secondary/10 text-secondary', glow: 'from-secondary/10' },
  success: { chip: 'bg-success/15 text-success', glow: 'from-success/10' },
  warning: { chip: 'bg-warning/15 text-warning', glow: 'from-warning/10' },
  destructive: { chip: 'bg-destructive/15 text-destructive', glow: 'from-destructive/10' },
};

export const StatCard = ({
  label,
  value,
  icon: Icon,
  to,
  hint,
  loading,
  tone = 'primary',
}: StatCardProps) => {
  const t = tones[tone];
  const body = (
    <div className="card-interactive relative flex items-center gap-4 overflow-hidden p-5">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl',
          t.glow,
        )}
      />
      <div className={cn('shrink-0 rounded-xl p-3', t.chip)}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1.5 h-8 w-12" />
        ) : (
          <p className="mt-0.5 font-display text-3xl font-semibold text-foreground">{value}</p>
        )}
        {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
      {body}
    </Link>
  ) : (
    body
  );
};
