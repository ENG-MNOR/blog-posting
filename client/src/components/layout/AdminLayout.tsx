import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileSearch,
  CalendarDays,
  Layers,
  Mail,
  LogOut,
  Globe,
  Users,
  Settings,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { resolveMediaUrl } from '@/lib/media';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';

const baseLinks = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Research', to: '/admin/research', icon: FileSearch },
  { label: 'Events', to: '/admin/events', icon: CalendarDays },
  { label: 'Content', to: '/admin/content', icon: Layers },
  { label: 'Messages', to: '/admin/messages', icon: Mail },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return 'N';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user]);

  const links = useMemo(() => {
    const l = [...baseLinks];
    if (user?.role === 'admin') {
      l.splice(1, 0, { label: 'Users', to: '/admin/users', icon: Users });
    }
    return l;
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
          {user?.avatarUrl ? (
            <img
              src={resolveMediaUrl(user.avatarUrl)}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{user?.name || 'Admin'}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{user?.role || 'user'}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="my-3 h-px bg-border" />

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Globe size={18} />
          View website
        </a>
        <ThemeToggle
          withLabel
          className="w-full justify-start rounded-lg px-3 py-2.5 hover:bg-muted hover:text-foreground"
        />
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </div>
  );

  const currentLabel = links.find((l) => pathname.startsWith(l.to))?.label ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface p-5 md:block">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface p-5 md:hidden"
            >
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold">{currentLabel}</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
