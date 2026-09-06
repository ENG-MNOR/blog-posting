import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Edit, ExternalLink, FileText, MapPin, Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEvents, useMutateEvents } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import type { EventItem } from '@/types';
import { eventSchema, type EventFormValues } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageGallery } from '@/components/ui/image-gallery';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { ImageUploader, type UploaderItem } from '@/components/admin/ImageUploader';
import { EntityCardActions } from '@/components/admin/EntityCardActions';

const MAX_IMAGES = 6;

const emptyValues: EventFormValues = {
  name: '',
  role: '',
  date: '',
  location: '',
  description: '',
  link: '',
  materialsUrl: '',
};

const isUpcoming = (event: EventItem) =>
  event.category === 'upcoming' || new Date(event.date).getTime() >= Date.now();

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

const EventCard = ({
  event,
  onEdit,
  onDelete,
}: {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const images = event.images?.length ? event.images : event.imageUrl ? [event.imageUrl] : [];
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted">
      {images.length > 0 && (
        <ImageGallery images={images} alt={event.name} markCover className="mb-4" />
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-xs font-medium uppercase tracking-wide text-secondary">
          {event.role}
        </p>
        <Badge variant={isUpcoming(event) ? 'secondary' : 'muted'} className="shrink-0">
          {isUpcoming(event) ? 'Upcoming' : 'Past'}
        </Badge>
      </div>

      <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-foreground">{event.name}</h3>

      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" /> {formatDate(event.date)}
        </p>
        {event.location && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {event.location}
          </p>
        )}
      </div>

      {event.description && (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
      )}

      {(event.link || event.materialsUrl) && (
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-primary">
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
              <ExternalLink className="h-4 w-4" /> Link
            </a>
          )}
          {event.materialsUrl && (
            <a href={event.materialsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
              <FileText className="h-4 w-4" /> Materials
            </a>
          )}
        </div>
      )}

      <div className="mt-auto">
        <EntityCardActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
};

const EventManagerPage = () => {
  const { data, isLoading, isError, refetch } = useEvents();
  const mutations = useMutateEvents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageItems, setImageItems] = useState<UploaderItem[]>([]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const confirm = useConfirm<EventItem>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({ resolver: zodResolver(eventSchema), defaultValues: emptyValues });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((e) => (tab === 'all' ? true : tab === 'upcoming' ? isUpcoming(e) : !isUpcoming(e)))
      .filter(
        (e) => !q || [e.name, e.role, e.location, e.description].some((f) => f?.toLowerCase().includes(q)),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, query, tab]);

  const counts = useMemo(() => {
    const all = data ?? [];
    const up = all.filter(isUpcoming).length;
    return { all: all.length, upcoming: up, past: all.length - up };
  }, [data]);

  const resetForm = () => {
    setEditingId(null);
    setImageItems([]);
    reset(emptyValues);
  };

  const startEdit = (event: EventItem) => {
    setEditingId(event._id);
    const existing = event.images?.length ? event.images : event.imageUrl ? [event.imageUrl] : [];
    setImageItems(existing.map((url) => ({ kind: 'existing', url })));
    reset({
      name: event.name,
      role: event.role,
      date: event.date?.slice(0, 10) ?? '',
      location: event.location ?? '',
      description: event.description ?? '',
      link: event.link ?? '',
      materialsUrl: event.materialsUrl ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (values: EventFormValues) => {
    const fd = new FormData();
    fd.append('name', values.name);
    fd.append('role', values.role);
    fd.append('date', values.date);
    fd.append('location', values.location ?? '');
    fd.append('description', values.description ?? '');
    fd.append('link', values.link ?? '');
    fd.append('materialsUrl', values.materialsUrl ?? '');

    const order: string[] = [];
    let newIndex = 0;
    for (const item of imageItems) {
      if (item.kind === 'existing') {
        fd.append('existingImages', item.url);
        order.push(`existing:${item.url}`);
      } else {
        fd.append('images', item.file);
        order.push(`new:${newIndex}`);
        newIndex += 1;
      }
    }
    fd.append('imageOrder', JSON.stringify(order));
    if (editingId && imageItems.length === 0) fd.append('clearImages', 'true');

    try {
      if (editingId) {
        await mutations.update.mutateAsync({ id: editingId, data: fd });
        toast.success('Event updated');
      } else {
        await mutations.create.mutateAsync(fd);
        toast.success('Event created');
      }
      resetForm();
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Events · Admin</title>
      </Helmet>
      <PageHeader
        eyebrow="Manage"
        title="Events"
        description="Schedule seminars, trainings, and missions — with up to 6 images each."
      />

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-max rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {editingId ? 'Edit event' : 'Add event'}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" error={errors.name?.message} {...register('name')} />
            </div>
            <div>
              <Label htmlFor="role">Your role</Label>
              <Input id="role" placeholder="Keynote speaker, facilitator…" error={errors.role?.message} {...register('role')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" error={errors.date?.message} {...register('date')} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" error={errors.location?.message} {...register('location')} />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} error={errors.description?.message} {...register('description')} />
            </div>
            <div>
              <Label htmlFor="link">Event link</Label>
              <Input id="link" placeholder="https://…" error={errors.link?.message} {...register('link')} />
            </div>
            <div>
              <Label htmlFor="materialsUrl">Materials link</Label>
              <Input id="materialsUrl" placeholder="https://…" error={errors.materialsUrl?.message} {...register('materialsUrl')} />
            </div>

            <ImageUploader items={imageItems} onChange={setImageItems} max={MAX_IMAGES} label="Event images" />
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
              {editingId ? 'Update event' : 'Create event'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Card grid */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              icon={<Search />}
              placeholder="Search events…"
              className="sm:w-64"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length} shown</span>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({counts.upcoming})</TabsTrigger>
              <TabsTrigger value="past">Past ({counts.past})</TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {isLoading ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : isError ? (
                <ErrorState onRetry={() => refetch()} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title={query ? 'No matching events' : 'No events yet'}
                  description={query ? 'Try a different search.' : 'Add your first event with the form.'}
                  icon={<CalendarDays className="h-5 w-5" />}
                />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filtered.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onEdit={() => startEdit(event)}
                      onDelete={() => confirm.ask(event)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => !o && confirm.close()}
        title="Delete this event?"
        description={confirm.target ? `“${confirm.target.name}” and its images will be permanently removed.` : ''}
        confirmLabel="Delete"
        destructive
        loading={confirm.loading}
        onConfirm={() =>
          confirm.run(async (event) => {
            try {
              await mutations.remove.mutateAsync(event._id);
              toast.success('Event deleted');
              if (editingId === event._id) resetForm();
            } catch (error) {
              toast.error(toApiError(error).message);
              throw error;
            }
          })
        }
      />
    </div>
  );
};

export default EventManagerPage;
