import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUsers, useMutateUsers } from "@/hooks/useApi";
import { User } from "@/types";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Shield,
  Trash2,
  Edit,
  Plus,
  User as UserIcon,
  Tag
} from "lucide-react";

type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  titles?: string; // Comma separated for input
};

const InputField = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    {children}
  </div>
);

const UserManagerPage = () => {
  const { data: users, isLoading } = useUsers();
  const mutations = useMutateUsers();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>();

  const onSubmit = async (values: UserFormValues) => {
    const loadingToast = toast.loading("Processing...");
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        role: values.role,
        titles: values.titles ? values.titles.split(',').map(t => t.trim()) : []
      };
      
      if (values.password) {
        payload.password = values.password;
      }

      if (editingId) {
        if (!values.password) delete payload.password;
        await mutations.update.mutateAsync({ id: editingId, data: payload });
        toast.success("User updated successfully.");
      } else {
        await mutations.create.mutateAsync(payload);
        toast.success("User created successfully.");
      }
      reset();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("role", user.role);
    setValue("titles", user.titles?.join(', ') || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await mutations.remove.mutateAsync(id);
      toast.success("User deleted successfully.");
      if (editingId === id) {
        reset();
        setEditingId(null);
      }
    } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Manage system users and permissions</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {editingId ? "Edit User" : "Add New User"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <InputField icon={UserIcon}>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Full Name"
                  />
                </InputField>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <InputField icon={Mail}>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="email@example.com"
                  />
                </InputField>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password {editingId && <span className="text-slate-400 font-normal">(Leave blank to keep)</span>}
                </label>
                <InputField icon={Lock}>
                  <input
                    type="password"
                    {...register("password", { required: !editingId && "Password is required" })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </InputField>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                <InputField icon={Shield}>
                  <select
                    {...register("role")}
                    className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </InputField>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Titles (comma separated)</label>
                <InputField icon={Tag}>
                   <input
                    {...register("titles")}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Dr., PhD, Researcher"
                  />
                </InputField>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingId ? <Edit size={16} /> : <Plus size={16} />}
                  {editingId ? "Update User" : "Add User"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setEditingId(null);
                    }}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
             <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="font-semibold text-slate-800">All Users</h3>
             </div>
             <div className="divide-y divide-slate-100">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading users...</div>
                ) : users?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No users found.</div>
                ) : (
                    users?.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800">{user.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{user.email}</span>
                                        <span>•</span>
                                        <span className={`capitalize ${user.role === 'admin' ? 'text-primary font-bold' : ''}`}>{user.role}</span>
                                        {user.titles && user.titles.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="text-slate-400">{user.titles.join(', ')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="rounded-md p-2 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                                    title="Edit"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagerPage;
