import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, ImagePlus, Mail, Plus, Search, Trash2, X } from 'lucide-react';
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
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { EntityCardActions } from '@/components/admin/EntityCardActions';

const UserCard = ({
  user,
  disableDelete,
  deleteReason,
  onEdit,
  onDelete,
}: {
  user: User;
  disableDelete?: boolean;
  deleteReason?: string;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted">
    <div className="flex items-start gap-3">
      {user.avatarUrl ? (
        <img
          src={resolveMediaUrl(user.avatarUrl)}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-foreground">{user.name}</p>
          <Badge variant={user.role === 'admin' ? 'default' : 'muted'} className="shrink-0">
            {user.role}
          </Badge>
        </div>
        <a
          href={`mailto:${user.email}`}
          className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-primary hover:underline"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
        </a>
      </div>
    </div>

    {user.titles && user.titles.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {user.titles.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>
    )}

    <div className="mt-auto">
      <EntityCardActions
        onEdit={onEdit}
        onDelete={disableDelete ? () => toast.error(deleteReason ?? 'Cannot delete') : onDelete}
        deleteLabel="Remove"
      />
    </div>
  </article>
);

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

  const adminCount = useMemo(() => (data ?? []).filter((u) => u.role === 'admin').length, [data]);

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

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Team · Admin</title>
      </Helmet>
      <PageHeader
        eyebrow="Manage"
        title="Team members"
        description="Add, edit, and remove the people who can access the dashboard."
      />

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Form */}
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
              {editingId ? 'Update member' : 'Add member'}
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
              placeholder="Search members…"
              className="sm:w-64"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
              title={query ? 'No matching members' : 'No team members'}
              description={query ? 'Try a different search.' : 'Add the first member with the form.'}
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {rows.map((u) => {
                const isSelf = u._id === currentUser?._id;
                const isLastAdmin = u.role === 'admin' && adminCount <= 1;
                return (
                  <UserCard
                    key={u._id}
                    user={u}
                    disableDelete={isSelf || isLastAdmin}
                    deleteReason={
                      isSelf ? 'You cannot remove your own account' : 'Cannot remove the last admin'
                    }
                    onEdit={() => startEdit(u)}
                    onDelete={() => confirm.ask(u)}
                  />
                );
              })}
            </div>
          )}
        </div>
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
