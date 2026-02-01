
import { useMemo, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

import {
  LayoutDashboard,
  FileSearch,
  CalendarDays,
  Layers,
  Mail,
  LogOut,
  Globe,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Research', to: '/admin/research', icon: FileSearch },
  { label: 'Events', to: '/admin/events', icon: CalendarDays },
  { label: 'Content', to: '/admin/content', icon: Layers },
  { label: 'Messages', to: '/admin/messages', icon: Mail },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const refresh = useAuthStore((s) => s.refresh);

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return 'N';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }, [user]);

  useEffect(() => {
    if (!accessToken && status === 'idle') {
      refresh();
    }
  }, [accessToken, status, refresh]);

  // While auth is checking
  if (status === 'loading' || (status === 'idle' && !accessToken)) {
    return <p className="p-8 text-center text-slate-500">Checking session...</p>;
  }

  // If not logged in, go login (no sidebar because login is a different route)
  if (status !== 'authenticated' || !accessToken) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const NavContent = () => (
    <>
      {/* User */}
      <div className="mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          {initials}
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">{user?.name || 'Welcome'}</p>
        <p className="text-xs uppercase text-slate-400">Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-500">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'hover:text-primary'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 hover:text-primary transition-colors"
        >
          <Globe size={18} />
          View Website
        </a>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        <LogOut size={18} />
        Logout
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative flex w-64 flex-col bg-white p-6 shadow-xl animate-in slide-in-from-left duration-200">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 shadow-sm md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-500 hover:text-slate-700"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-semibold text-slate-700">Admin</span>
        </div>
        <div className="p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
