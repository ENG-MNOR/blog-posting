import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Star, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { resolveMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { Img } from '@/components/ui/image';

export type UploaderItem =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; preview: string };

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024;

interface ImageUploaderProps {
  items: UploaderItem[];
  onChange: (items: UploaderItem[]) => void;
  max?: number;
  label?: string;
}

/**
 * Drag-and-drop uploader with reorderable thumbnails. The first image is the
 * cover. Emits an ordered list of existing URLs + new Files for the caller to
 * turn into FormData.
 */
export const ImageUploader = ({ items, onChange, max = 3, label = 'Images' }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Revoke object URLs for any 'new' item that leaves the list.
  const previews = useMemo(
    () => items.filter((i): i is Extract<UploaderItem, { kind: 'new' }> => i.kind === 'new').map((i) => i.preview),
    [items],
  );
  useEffect(
    () => () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    },
    [previews],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);
      const room = max - items.length;
      if (room <= 0) {
        toast.error(`Up to ${max} images`);
        return;
      }
      const accepted: UploaderItem[] = [];
      for (const file of incoming.slice(0, room)) {
        if (!ACCEPT.includes(file.type)) {
          toast.error(`${file.name}: only PNG, JPG or WEBP`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name}: larger than 8 MB`);
          continue;
        }
        accepted.push({ kind: 'new', file, preview: URL.createObjectURL(file) });
      }
      if (incoming.length > room) toast.error(`Only ${room} more image${room === 1 ? '' : 's'} allowed`);
      if (accepted.length) onChange([...items, ...accepted]);
    },
    [items, max, onChange],
  );

  const remove = (index: number) => {
    const target = items[index];
    if (target.kind === 'new') URL.revokeObjectURL(target.preview);
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const srcFor = (item: UploaderItem) =>
    item.kind === 'new' ? item.preview : resolveMediaUrl(item.url);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {items.length}/{max}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-input bg-surface hover:border-primary/50 hover:bg-muted',
          items.length >= max && 'pointer-events-none opacity-50',
        )}
      >
        <UploadCloud className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-foreground">
          Drop images here or <span className="text-primary">browse</span>
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG or WEBP · up to 8 MB · max {max}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {items.map((item, index) => (
            <li
              key={item.kind === 'new' ? item.preview : item.url}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnter={() => {
                if (dragIndex !== null && dragIndex !== index) {
                  move(dragIndex, index);
                  setDragIndex(index);
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border border-border',
                dragIndex === index && 'opacity-50',
              )}
            >
              <Img src={srcFor(item)} alt="" wrapperClassName="h-full w-full" />

              {index === 0 && (
                <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Star className="h-3 w-3" /> Cover
                </span>
              )}
              {item.kind === 'new' && (
                <span className="absolute bottom-1 left-1 rounded bg-success/90 px-1 py-0.5 text-[9px] font-medium text-success-foreground">
                  New
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-slate-950/55 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  className="rounded p-1 text-white/90 hover:bg-white/20 disabled:opacity-30"
                  aria-label="Move left"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded p-1 text-white/90 hover:bg-destructive"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === items.length - 1}
                  className="rounded p-1 text-white/90 hover:bg-white/20 disabled:opacity-30"
                  aria-label="Move right"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length === 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImagePlus className="h-3.5 w-3.5" /> The first image becomes the cover.
        </p>
      )}
    </div>
  );
};
