import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';

type LoginValues = {
  email: string;
  password: string;
};

const AdminLoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginValues>();

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      const from = (location.state as { from?: Location })?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch {
      setError('password', { message: 'Invalid credentials' });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm uppercase tracking-[0.4em] text-primary/60">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold text-dark">Dashboard Login</h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>

        {/* Email Input */}
        <div>
          <label className="text-sm font-semibold text-slate-600">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-10 py-2 outline-none focus:border-primary"
              {...register('email', { required: 'Email is required' })}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div className="relative">
          <label className="text-sm font-semibold text-slate-600">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-10 py-2 outline-none focus:border-primary"
              {...register('password', { required: 'Password is required' })}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          disabled={status === 'loading'}
        >
          <LogIn size={18} />
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
