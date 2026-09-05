import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardResearch, useMutateResearch } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import type { Research } from '@/types';
import { researchSchema, type ResearchFormValues } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';

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
    <Badge variant="warning">Pending</Badge>
  ) : (
    <Badge variant="muted">Draft</Badge>
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
    return (data ?? []).filter((item) => {
      const matchesQuery =
        !q || [item.title, item.summary, item.journal, item.topic].some((f) => f?.toLowerCase().includes(q));
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
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

  const columns = useMemo<ColumnDef<Research, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="max-w-sm">
            <p className="line-clamp-1 font-medium text-foreground">{row.original.title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{row.original.summary}</p>
          </div>
        ),
      },
      { accessorKey: 'year', header: 'Year', cell: ({ getValue }) => getValue<number>() },
      {
        accessorKey: 'topic',
        header: 'Topic',
        cell: ({ getValue }) => getValue<string>() || '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => statusBadge(getValue<string>() || 'draft'),
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
        <title>Research · Admin</title>
      </Helmet>
      <PageHeader
        eyebrow="Manage"
        title="Research"
        description="Add, edit, and publish research papers."
      />

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
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
              {!isAdmin && (
                <p className="mt-1 text-xs text-muted-foreground">Only admins can publish.</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
              {editingId ? 'Update' : 'Add research'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
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
          emptyTitle={query || statusFilter ? 'No matching research' : 'No research yet'}
          emptyDescription={query || statusFilter ? 'Try clearing filters.' : 'Add your first entry with the form.'}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <Input
                icon={<Search />}
                placeholder="Search research…"
                className="sm:w-64"
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
          }
        />
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
