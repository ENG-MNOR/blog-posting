import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden />
);

export const LoadingScreen = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
    <Spinner className="h-6 w-6" />
    <p className="text-sm">{label}</p>
  </div>
);
