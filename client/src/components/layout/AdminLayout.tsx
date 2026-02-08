import { useMemo, useState, useEffect } from 'react';
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
  Moon,
  Sun
} from 'lucide-react';

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 md:flex">
        {/* User */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary dark:bg-slate-800 dark:text-sky-400">
             {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "")}${user.avatarUrl}`} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
            ) : initials}
          </div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Welcome'}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{user?.role || 'User'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md dark:bg-sky-600"
                      : "hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}

          <div className="my-4 border-t border-slate-100 dark:border-slate-800" />
          
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Globe size={18} />
            View Website
          </a>

          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
         {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <span>Admin Panel</span>
            <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button onClick={handleLogout} className="p-2 text-slate-500 dark:text-slate-400">
                    <LogOut size={20} />
                </button>
            </div>
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
