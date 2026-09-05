import { cn } from '@/lib/utils';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('skeleton h-4 w-full', className)} {...props} />
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={i === lines - 1 ? 'w-2/3' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('rounded-2xl border border-border bg-card p-5', className)}>
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-3 h-5 w-3/4" />
    <SkeletonText lines={2} className="mt-3" />
  </div>
);
