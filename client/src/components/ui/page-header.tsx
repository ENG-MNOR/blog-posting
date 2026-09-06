import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ eyebrow, title, description, actions, className }: PageHeaderProps) => (
  <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
