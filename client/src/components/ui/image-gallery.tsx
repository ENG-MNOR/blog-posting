import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from './dialog';

interface ImageGalleryProps {
  /** Raw stored paths ("/uploads/…") or absolute URLs. */
  images?: string[];
  alt?: string;
  /** 'feature' = big first image + grid of the rest. 'grid' = uniform grid. */
  layout?: 'feature' | 'grid';
  className?: string;
}

/**
 * Responsive image gallery with a full-screen lightbox that steps through
 * every image (arrows, keyboard, swipe-friendly). Broken images drop out
 * automatically.
 */
export const ImageGallery = ({ images, alt = '', layout = 'feature', className }: ImageGalleryProps) => {
  const resolved = useMemo(() => (images ?? []).map(resolveMediaUrl).filter(Boolean), [images]);
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const visible = resolved.filter((src) => !broken.has(src));
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, step]);

  if (visible.length === 0) return null;

  const markFail = (src: string) => setBroken((prev) => new Set(prev).add(src));

  const Thumb = ({ src, i, className: c }: { src: string; i: number; className?: string }) => (
    <button
      type="button"
      onClick={() => setIndex(i)}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        c,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => markFail(src)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
      />
    </button>
  );

  const feature = layout === 'feature' && visible.length >= 3;

  return (
    <>
      {feature ? (
        <div className={cn('grid gap-2 sm:grid-cols-3', className)}>
          <Thumb src={visible[0]} i={0} className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto" />
          {visible.slice(1, 5).map((src, k) => (
            <Thumb key={src} src={src} i={k + 1} className="aspect-square" />
          ))}
          {visible.length > 5 && (
            <button
              type="button"
              onClick={() => setIndex(5)}
              className="relative flex aspect-square items-center justify-center rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/70"
            >
              +{visible.length - 5} more
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-2',
            visible.length === 1 ? 'grid-cols-1' : visible.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
            className,
          )}
        >
          {visible.map((src, i) => (
            <Thumb key={src} src={src} i={i} className={visible.length === 1 ? 'aspect-[16/9]' : 'aspect-square'} />
          ))}
        </div>
      )}

      <Dialog open={index !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none" hideClose>
          {index !== null && (
            <div className="relative">
              <img
                src={visible[index]}
                alt={alt}
                className="max-h-[82vh] w-full rounded-2xl bg-slate-950/40 object-contain"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-2 top-2 rounded-full bg-slate-950/60 p-1.5 text-white hover:bg-slate-950/80"
              >
                <X className="h-5 w-5" />
              </button>
              {visible.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/60 p-2 text-white hover:bg-slate-950/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/60 p-2 text-white hover:bg-slate-950/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-white">
                    {index + 1} / {visible.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
