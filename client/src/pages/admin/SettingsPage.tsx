import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { useProfileMutation } from '@/hooks/useApi';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const mutations = useProfileMutation();
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm();

  const onProfileSubmit = async (data: any) => {
    try {
      await mutations.updateProfile.mutateAsync(data);
      toast.success('Profile updated successfully');
      // Ideally update auth store here, but for now a reload or subsequent fetch will handle it
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await mutations.updatePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and security.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
              <input
                {...registerProfile('name', { required: 'Name is required' })}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {profileErrors.name && (
                <p className="mt-1 text-xs text-red-500">{String(profileErrors.name.message)}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
              <input
                {...registerProfile('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                type="email"
                disabled
                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed focus:border-slate-300 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
              {profileErrors.email && (
                <p className="mt-1 text-xs text-red-500">{String(profileErrors.email.message)}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Save size={16} />
                {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* Security Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Security</h2>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
              <input
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                type="password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{String(passwordErrors.currentPassword.message)}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
              <input
                {...registerPassword('newPassword', { 
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                type="password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{String(passwordErrors.newPassword.message)}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                {...registerPassword('confirmPassword', { required: 'Please confirm your password' })}
                type="password"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                <Save size={16} />
                {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
