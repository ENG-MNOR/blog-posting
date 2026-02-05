import { useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

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
} from 'lucide-react';

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const initials = useMemo(() => {
    if (!user?.name) return 'N';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = useMemo(() => {
    const links = [
      { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Research', to: '/admin/research', icon: FileSearch },
      { label: 'Events', to: '/admin/events', icon: CalendarDays },
      { label: 'Content', to: '/admin/content', icon: Layers },
      { label: 'Messages', to: '/admin/messages', icon: Mail },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ];

    if (user?.role === 'admin') {
      links.splice(1, 0, { label: 'Users', to: '/admin/users', icon: Users });
    }

    return links;
  }, [user]);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex shadow-sm">
        {/* User */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold mb-3">
            {initials}
          </div>
          <p className="text-base font-semibold text-slate-800">{user?.name || 'Welcome'}</p>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{user?.role || 'User'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-600">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}

          <div className="mt-4 border-t border-slate-100 pt-4">
             {/* View Website Link */}
            <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
            >
                <Globe size={18} />
                View Website
            </a>
          </div>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 justify-center rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Mobile Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm md:hidden flex justify-between items-center">
            <span>Admin Panel</span>
            <button onClick={handleLogout} className="p-2 text-slate-500">
                <LogOut size={20} />
            </button>
        </div>
        
        <main className="flex-1 overflow-auto p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                 <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
