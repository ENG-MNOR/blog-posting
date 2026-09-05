import * as React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import { Spinner } from './spinner';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
}: ConfirmDialogProps) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lifted data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
        <AlertDialog.Title className="text-lg font-semibold text-foreground">{title}</AlertDialog.Title>
        {description && (
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialog.Cancel
            disabled={loading}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {cancelLabel}
          </AlertDialog.Cancel>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
            className={cn(
              buttonVariants({ variant: destructive ? 'destructive' : 'default', size: 'sm' }),
            )}
          >
            {loading && <Spinner />}
            {confirmLabel}
          </button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

/** Hook that wires a single ConfirmDialog to an async action with a target payload. */
export function useConfirm<T>() {
  const [target, setTarget] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  return {
    target,
    loading,
    open: target !== null,
    ask: (value: T) => setTarget(value),
    close: () => (loading ? undefined : setTarget(null)),
    run: async (fn: (value: T) => Promise<void>) => {
      if (target === null) return;
      setLoading(true);
      try {
        await fn(target);
        setTarget(null);
      } finally {
        setLoading(false);
      }
    },
  };
}
