import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { Img } from './image';
import { Dialog, DialogContent } from './dialog';

interface ImageGalleryProps {
  /** Raw stored paths ("/uploads/…") or absolute URLs. */
  images?: string[];
  alt?: string;
  /** Show a "Cover" marker on the first image. */
  markCover?: boolean;
  className?: string;
}

/** Responsive thumbnail strip with a click-to-zoom lightbox. */
export const ImageGallery = ({ images, alt = '', markCover, className }: ImageGalleryProps) => {
  const resolved = useMemo(
    () => (images ?? []).map(resolveMediaUrl).filter(Boolean),
    [images],
  );
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const visible = resolved.filter((src) => !broken.has(src));
  const [active, setActive] = useState<string | null>(null);

  if (visible.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          'grid gap-2',
          visible.length === 1 ? 'grid-cols-1' : visible.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
          className,
        )}
      >
        {visible.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(src)}
            className="group relative overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onError={() => setBroken((prev) => new Set(prev).add(src))}
              className={cn(
                'w-full object-cover transition-transform duration-300 group-hover:scale-105',
                visible.length === 1 ? 'h-48' : 'h-24',
              )}
            />
            {markCover && i === 0 && (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-primary/90 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                <Star className="h-3 w-3" /> Cover
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none" hideClose>
          {active && (
            <Img
              src={active}
              alt={alt}
              wrapperClassName="w-full rounded-2xl bg-transparent"
              className="max-h-[80vh] w-full !object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
