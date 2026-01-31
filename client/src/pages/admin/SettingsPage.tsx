import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/api/client';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Lock, Save, Loader2 } from 'lucide-react';

const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  
  // Update Profile Form
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile } } = useForm({
    defaultValues: {
      name: user?.name || ''
    }
  });

  const onSubmitProfile = async (data: { name: string }) => {
    try {
      const res = await apiClient.put('/auth/profile', data);
      useAuthStore.setState({ user: res.data.user });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  // Update Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword } } = useForm();

  const onSubmitPassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await apiClient.put('/auth/password', {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Manage your account settings</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 flex items-center gap-2">
            <UserIcon size={20} className="text-primary" />
            Profile Information
          </h2>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Name</label>
              <input
                {...registerProfile('name', { required: 'Name is required' })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-primary"
              />
              {errorsProfile.name && <p className="text-xs text-red-500 mt-1">{errorsProfile.name.message as string}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-500 outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
            </div>
            <button
              disabled={isSubmittingProfile}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmittingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            Change Password
          </h2>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-primary"
              />
              {errorsPassword.currentPassword && <p className="text-xs text-red-500 mt-1">{errorsPassword.currentPassword.message as string}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">New Password</label>
              <input
                type="password"
                {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-primary"
              />
              {errorsPassword.newPassword && <p className="text-xs text-red-500 mt-1">{errorsPassword.newPassword.message as string}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Confirm New Password</label>
              <input
                type="password"
                {...registerPassword('confirmPassword', { required: 'Confirm password is required' })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-primary"
              />
              {errorsPassword.confirmPassword && <p className="text-xs text-red-500 mt-1">{errorsPassword.confirmPassword.message as string}</p>}
            </div>
            <button
              disabled={isSubmittingPassword}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmittingPassword ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
