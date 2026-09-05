import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { Lock, Save, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import { useProfileMutation } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import { profileSchema, passwordSchema } from '@/lib/schemas';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const { updateProfile, updatePassword } = useProfileMutation();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfile = async (data: ProfileValues) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Profile updated');
    } catch (error) {
      const { message, fieldErrors } = toApiError(error);
      if (fieldErrors.email) profileForm.setError('email', { message: fieldErrors.email });
      toast.error(message);
    }
  };

  const onPassword = async (data: PasswordValues) => {
    try {
      await updatePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password updated');
      passwordForm.reset();
    } catch (error) {
      const { message } = toApiError(error);
      passwordForm.setError('currentPassword', { message });
      toast.error(message);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <Helmet>
        <title>Settings · Admin</title>
      </Helmet>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile and password." />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="h-max rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <UserCog size={18} />
            </span>
            <h2 className="text-base font-semibold text-foreground">Profile</h2>
          </div>
          <form onSubmit={profileForm.handleSubmit(onProfile)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                error={profileForm.formState.errors.email?.message}
                {...profileForm.register('email')}
              />
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? <Spinner /> : <Save size={16} />}
              Save changes
            </Button>
          </form>
        </section>

        <section className="h-max rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-lg bg-secondary/10 p-2 text-secondary">
              <Lock size={18} />
            </span>
            <h2 className="text-base font-semibold text-foreground">Security</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onPassword)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? <Spinner /> : <Save size={16} />}
              Update password
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
