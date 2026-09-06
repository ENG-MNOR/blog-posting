import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { ArrowLeft, CalendarDays, FileText, Lock, LogIn, Mail, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { toApiError } from '@/api/client';
import { LogoMark } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof schema>;

const highlights = [
  { icon: FileText, label: 'Research & publications' },
  { icon: CalendarDays, label: 'Events & engagements' },
  { icon: MessageSquare, label: 'Inbound messages' },
];

const AdminLoginPage = () => {
  const login = useAuthStore((s) => s.login);
  const accessToken = useAuthStore((s) => s.accessToken);
  const status = useAuthStore((s) => s.status);
  const refresh = useAuthStore((s) => s.refresh);
  const navigate = useNavigate();
  const location = useLocation();

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

      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel — fixed dark brand gradient in both themes */}
        <aside className="relative hidden overflow-hidden bg-[#0B1B2B] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_55%_at_12%_8%,rgb(15_76_129/0.75),transparent_62%),radial-gradient(55%_55%_at_92%_18%,rgb(14_154_167/0.4),transparent_58%),radial-gradient(60%_60%_at_75%_100%,rgb(246_205_97/0.14),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full border border-white/10"
          />
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 p-2 text-white ring-1 ring-white/20">
              <LogoMark />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Nor Haji Osman</p>
              <p className="font-display text-lg">Public Health Leader</p>
            </div>
          </div>

          <div className="relative max-w-sm">
            <h2 className="font-display text-3xl leading-tight">
              The control room for your{' '}
              <span className="bg-gradient-to-r from-sky-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                public presence
              </span>
              .
            </h2>
            <ul className="mt-6 space-y-3">
              {highlights.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Nor Haji Osman</p>
        </aside>

        {/* Form panel */}
        <main className="bg-mesh flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to website
            </Link>

            <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/12 to-secondary/12 p-2.5 text-primary ring-1 ring-border lg:hidden">
              <LogoMark />
            </span>

            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 font-display text-3xl text-foreground">Dashboard sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage research, events, content, and messages.
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        </main>
      </div>
    </>
  );
};

export default AdminLoginPage;
