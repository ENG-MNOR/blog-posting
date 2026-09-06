import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, ExternalLink, FileText, Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardResearch, useMutateResearch } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import { resolveMediaUrl } from '@/lib/media';
import { useAuthStore } from '@/store/auth';
import type { Research } from '@/types';
import { researchSchema, type ResearchFormValues } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { EntityCardActions } from '@/components/admin/EntityCardActions';

const emptyValues: ResearchFormValues = {
  title: '',
  year: new Date().getFullYear(),
  journal: '',
  topic: '',
  summary: '',
  pdfUrl: '',
  externalLink: '',
  status: 'draft',
};

const statusBadge = (status: string) =>
  status === 'published' ? (
    <Badge variant="success">Published</Badge>
  ) : status === 'pending_review' ? (
    <Badge variant="warning">Pending review</Badge>
  ) : (
    <Badge variant="muted">Draft</Badge>
  );

const ResearchCard = ({
  item,
  onEdit,
  onDelete,
}: {
  item: Research;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted">
    <div className="flex flex-wrap items-center gap-2">
      {item.topic && (
        <Badge variant="secondary" className="uppercase tracking-wide">
          {item.topic}
        </Badge>
      )}
      <span className="text-xs text-muted-foreground">{item.year}</span>
      <span className="ml-auto">{statusBadge(item.status || 'draft')}</span>
    </div>

    <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
    {item.journal && <p className="text-sm text-muted-foreground">{item.journal}</p>}
    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.summary}</p>

    {(item.pdfUrl || item.externalLink) && (
      <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-primary">
        {item.pdfUrl && (
          <a href={resolveMediaUrl(item.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
            <FileText className="h-4 w-4" /> PDF
          </a>
        )}
        {item.externalLink && (
          <a href={resolveMediaUrl(item.externalLink)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
            <ExternalLink className="h-4 w-4" /> Journal
          </a>
        )}
      </div>
    )}

    <div className="mt-auto">
      <EntityCardActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  </article>
);

const ResearchManagerPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const { data, isLoading, isError, refetch } = useDashboardResearch();
  const mutations = useMutateResearch();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const confirm = useConfirm<Research>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: emptyValues,
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((item) => {
        const matchesQuery =
          !q || [item.title, item.summary, item.journal, item.topic].some((f) => f?.toLowerCase().includes(q));
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }, [data, query, statusFilter]);

  const startEdit = (item: Research) => {
    setEditingId(item._id);
    reset({
      title: item.title,
      year: item.year,
      journal: item.journal ?? '',
      topic: item.topic ?? '',
      summary: item.summary,
      pdfUrl: item.pdfUrl ?? '',
      externalLink: item.externalLink ?? '',
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(emptyValues);
  };

  const onSubmit = async (values: ResearchFormValues) => {
    try {
      if (editingId) {
        await mutations.update.mutateAsync({ id: editingId, data: values });
        toast.success('Research updated');
      } else {
        await mutations.create.mutateAsync(values);
        toast.success('Research added');
      }
      cancelEdit();
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Research · Admin</title>
      </Helmet>
      <PageHeader eyebrow="Manage" title="Research" description="Add, edit, publish, and remove research papers." />

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-max rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {editingId ? 'Edit research' : 'Add research'}
            </h2>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" error={errors.title?.message} {...register('title')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" error={errors.year?.message} {...register('year')} />
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" error={errors.topic?.message} {...register('topic')} />
              </div>
            </div>
            <div>
              <Label htmlFor="journal">Journal</Label>
              <Input id="journal" error={errors.journal?.message} {...register('journal')} />
            </div>
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" rows={4} error={errors.summary?.message} {...register('summary')} />
            </div>
            <div>
              <Label htmlFor="pdfUrl">PDF URL</Label>
              <Input id="pdfUrl" placeholder="https://…" error={errors.pdfUrl?.message} {...register('pdfUrl')} />
            </div>
            <div>
              <Label htmlFor="externalLink">External link</Label>
              <Input id="externalLink" placeholder="https://…" error={errors.externalLink?.message} {...register('externalLink')} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" error={errors.status?.message} {...register('status')}>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending review</option>
                {isAdmin && <option value="published">Published</option>}
              </Select>
              {!isAdmin && <p className="mt-1 text-xs text-muted-foreground">Only admins can publish.</p>}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
              {editingId ? 'Update research' : 'Add research'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
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
              placeholder="Search research…"
              className="sm:w-56"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              className="sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending review</option>
              <option value="published">Published</option>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">{rows.length} shown</span>
          </div>

          {isLoading ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={query || statusFilter ? 'No matching research' : 'No research yet'}
              description={query || statusFilter ? 'Try clearing filters.' : 'Add your first entry with the form.'}
              icon={<FileText className="h-5 w-5" />}
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {rows.map((item) => (
                <ResearchCard
                  key={item._id}
                  item={item}
                  onEdit={() => startEdit(item)}
                  onDelete={() => confirm.ask(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => !o && confirm.close()}
        title="Delete this research entry?"
        description={confirm.target ? `“${confirm.target.title}” will be permanently removed.` : ''}
        confirmLabel="Delete"
        destructive
        loading={confirm.loading}
        onConfirm={() =>
          confirm.run(async (item) => {
            try {
              await mutations.remove.mutateAsync(item._id);
              toast.success('Research deleted');
              if (editingId === item._id) cancelEdit();
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

export default ResearchManagerPage;
