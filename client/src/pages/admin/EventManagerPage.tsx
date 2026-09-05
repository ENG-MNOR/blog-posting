import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEvents, useMutateEvents } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import { resolveMediaUrl } from '@/lib/media';
import type { EventItem } from '@/types';
import { eventSchema, type EventFormValues } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Img } from '@/components/ui/image';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { ImageUploader, type UploaderItem } from '@/components/admin/ImageUploader';

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

const EventManagerPage = () => {
  const { data, isLoading, isError, refetch } = useEvents();
  const mutations = useMutateEvents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageItems, setImageItems] = useState<UploaderItem[]>([]);
  const [query, setQuery] = useState('');
  const confirm = useConfirm<EventItem>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({ resolver: zodResolver(eventSchema), defaultValues: emptyValues });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (e) => !q || [e.name, e.role, e.location, e.description].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [data, query]);

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

    // Ordered image payload: existing URLs kept, new files uploaded, and an
    // imageOrder token list so the server can rebuild the exact sequence.
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

  const columns = useMemo<ColumnDef<EventItem, unknown>[]>(
    () => [
      {
        id: 'cover',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const cover = row.original.images?.[0] ?? row.original.imageUrl;
          return (
            <Img
              src={resolveMediaUrl(cover)}
              alt=""
              compact
              wrapperClassName="h-10 w-10 shrink-0 rounded-lg border border-border"
            />
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Event',
        cell: ({ row }) => (
          <div>
            <p className="line-clamp-1 font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.role}</p>
          </div>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => getValue<string>() || '—',
      },
      {
        id: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) =>
          isUpcoming(row.original) ? (
            <Badge variant="secondary">Upcoming</Badge>
          ) : (
            <Badge variant="muted">Past</Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(row.original)} aria-label="Edit">
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => confirm.ask(row.original)}
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Events · Admin</title>
      </Helmet>
      <PageHeader eyebrow="Manage" title="Events" description="Schedule seminars, trainings, and missions." />

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
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

            <ImageUploader items={imageItems} onChange={setImageItems} max={3} />
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
              {editingId ? 'Update' : 'Create event'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          getRowId={(r) => r._id}
          emptyTitle={query ? 'No matching events' : 'No events yet'}
          emptyDescription={query ? 'Try a different search.' : 'Add your first event with the form.'}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <Input
                icon={<Search />}
                placeholder="Search events…"
                className="sm:w-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="ml-auto text-xs text-muted-foreground">{rows.length} shown</span>
            </div>
          }
        />
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => !o && confirm.close()}
        title="Delete this event?"
        description={confirm.target ? `“${confirm.target.name}” will be permanently removed.` : ''}
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
