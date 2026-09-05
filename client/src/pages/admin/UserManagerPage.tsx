import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import { Edit, ImagePlus, Plus, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsers, useMutateUsers } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import { resolveMediaUrl } from '@/lib/media';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';
import { userSchema } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Select, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';

const UserManagerPage = () => {
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useUsers();
  const mutations = useMutateUsers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const confirm = useConfirm<User>();

  const schema = useMemo(() => userSchema(Boolean(editingId)), [editingId]);
  type FormValues = z.infer<ReturnType<typeof userSchema>>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', role: 'user', titles: '' },
  });

  const admins = useMemo(() => (data ?? []).filter((u) => u.role === 'admin'), [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (u) => !q || [u.name, u.email, ...(u.titles ?? [])].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [data, query]);

  const resetForm = () => {
    setEditingId(null);
    setAvatar(null);
    reset({ name: '', email: '', password: '', role: 'user', titles: '' });
  };

  const startEdit = (u: User) => {
    setEditingId(u._id);
    setAvatar(null);
    reset({
      name: u.name,
      email: u.email,
      password: '',
      role: (u.role === 'admin' ? 'admin' : 'user') as FormValues['role'],
      titles: u.titles?.join(', ') ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (values: FormValues) => {
    const fd = new FormData();
    fd.append('name', values.name);
    fd.append('email', values.email);
    fd.append('role', values.role);
    fd.append(
      'titles',
      JSON.stringify(
        (values.titles ?? '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    );
    if (values.password) fd.append('password', values.password);
    if (avatar) fd.append('avatar', avatar);

    try {
      if (editingId) {
        await mutations.update.mutateAsync({ id: editingId, data: fd });
        toast.success('Team member updated');
      } else {
        await mutations.create.mutateAsync(fd);
        toast.success('Team member added');
      }
      resetForm();
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Member',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.avatarUrl ? (
              <img
                src={resolveMediaUrl(row.original.avatarUrl)}
                alt=""
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {row.original.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => (
          <Badge variant={getValue<string>() === 'admin' ? 'default' : 'muted'}>
            {getValue<string>()}
          </Badge>
        ),
      },
      {
        id: 'titles',
        header: 'Titles',
        enableSorting: false,
        cell: ({ row }) => row.original.titles?.join(', ') || '—',
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const isSelf = row.original._id === currentUser?._id;
          const isLastAdmin = row.original.role === 'admin' && admins.length <= 1;
          return (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(row.original)} aria-label="Edit">
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                disabled={isSelf || isLastAdmin}
                title={isSelf ? 'You cannot delete yourself' : isLastAdmin ? 'Cannot remove the last admin' : 'Delete'}
                onClick={() => confirm.ask(row.original)}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser?._id, admins.length],
  );

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Team · Admin</title>
      </Helmet>
      <PageHeader eyebrow="Manage" title="Team members" description="Control who can access the dashboard." />

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-max rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {editingId ? 'Edit member' : 'Add member'}
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <div>
              <Label htmlFor="password">
                Password {editingId && <span className="font-normal text-muted-foreground">(blank = keep)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" error={errors.role?.message} {...register('role')}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="titles">Titles (comma separated)</Label>
              <Input id="titles" placeholder="Dr., MPH" error={errors.titles?.message} {...register('titles')} />
            </div>
            <div>
              <Label>Avatar</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-surface px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                <ImagePlus size={16} />
                {avatar ? avatar.name : 'Choose image'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
              {editingId ? 'Update' : 'Add member'}
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
          emptyTitle={query ? 'No matching members' : 'No team members'}
          toolbar={
            <div className="flex flex-wrap items-center gap-3">
              <Input
                icon={<Search />}
                placeholder="Search members…"
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
        title="Remove this team member?"
        description={confirm.target ? `${confirm.target.name} will lose dashboard access.` : ''}
        confirmLabel="Remove"
        destructive
        loading={confirm.loading}
        onConfirm={() =>
          confirm.run(async (u) => {
            try {
              await mutations.remove.mutateAsync(u._id);
              toast.success('Team member removed');
              if (editingId === u._id) resetForm();
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

export default UserManagerPage;
