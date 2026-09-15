import { cn } from '@/lib/utils';

/**
 * NOR monogram — interlocking rotated squares echoing the brand mark.
 * Pure SVG in `currentColor`, so it stays crisp and theme-aware with no
 * white-background image tile.
 */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    className={cn('h-full w-full', className)}
    fill="none"
    role="img"
    aria-label="Nor Haji Osman"
  >
    <rect
      x="8"
      y="8"
      width="32"
      height="32"
      rx="7"
      transform="rotate(45 24 24)"
      stroke="currentColor"
      strokeWidth="4"
    />
    <rect
      x="13"
      y="13"
      width="22"
      height="22"
      rx="5"
      transform="rotate(45 24 24)"
      stroke="currentColor"
      strokeWidth="4"
      opacity="0.5"
    />
    <path
      d="M18 30V18l12 12M30 18v12"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Mark + wordmark lockup used in headers. */
export const Logo = ({
  className,
  markClassName,
  subtitle = 'HMIS Specialist',
}: {
  className?: string;
  markClassName?: string;
  subtitle?: string;
}) => (
  <span className={cn('flex items-center gap-2.5 leading-tight', className)}>
    <span className={cn('grid h-9 w-9 shrink-0 place-items-center text-primary', markClassName)}>
      <LogoMark />
    </span>
    <span className="flex flex-col">
      <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Nor Haji Osman
      </span>
      <span className="whitespace-nowrap font-display text-base text-foreground sm:text-lg">
        {subtitle}
      </span>
    </span>
  </span>
);
