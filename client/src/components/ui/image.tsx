import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  /** Wrapper class — controls the box (size, radius, aspect). */
  wrapperClassName?: string;
  /** Small icon-only fallback vs. a labelled one. */
  compact?: boolean;
  /** Text shown in the placeholder (non-compact only). */
  fallbackLabel?: string;
}

/**
 * <img> that degrades to a clean placeholder when the file is missing or the
 * URL is empty — instead of the browser's broken-image glyph + sprawling alt
 * text. Used everywhere uploads are shown (events, avatars, hero, content).
 */
export const Img = ({
  src,
  alt = '',
  className,
  wrapperClassName,
  compact,
  fallbackLabel = 'Image unavailable',
  ...rest
}: ImgProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showFallback = !src || failed;

  return (
    <span
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-muted text-muted-foreground',
        wrapperClassName,
      )}
    >
      {showFallback ? (
        <span className="flex flex-col items-center gap-1 p-2 text-center">
          <ImageOff className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
          {!compact && <span className="text-[10px] leading-tight">{fallbackLabel}</span>}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', className)}
          {...rest}
        />
      )}
    </span>
  );
};
