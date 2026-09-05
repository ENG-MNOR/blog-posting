import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { toApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof schema>;

const AdminLoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refresh = useAuthStore((s) => s.refresh);
  const navigate = useNavigate();
  const location = useLocation();

  // If a refresh cookie is still valid, don't make the user log in again.
  useEffect(() => {
    if (!accessToken && status === 'idle') void refresh();
  }, [accessToken, status, refresh]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  if (status === 'authenticated' && accessToken) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      const from = (location.state as { from?: Location })?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      const { status: code } = toApiError(error);
      setError('root', {
        message:
          code === 429
            ? 'Too many attempts. Wait a moment and try again.'
            : 'Email or password is incorrect.',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin sign in | Nor Haji Osman</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lifted">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">Admin</p>
          <h1 className="mt-2 font-display text-3xl text-foreground">Dashboard sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage research, events, content, and messages.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                icon={<Mail />}
                placeholder="you@example.org"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                icon={<Lock />}
                placeholder="Your password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {errors.root && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : <LogIn className="h-4 w-4" />}
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
