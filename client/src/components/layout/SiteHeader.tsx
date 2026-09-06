import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LogoMark } from '@/components/common/Logo';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Research', to: '/research' },
  { label: 'Events', to: '/events' },
  { label: 'Contact', to: '/contact' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative text-sm font-medium transition-colors hover:text-primary',
    'after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all after:duration-300',
    isActive ? 'text-primary after:w-full' : 'text-muted-foreground after:w-0 hover:after:w-full',
  );

const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-border bg-surface/80 shadow-soft backdrop-blur-xl'
          : 'border-transparent bg-surface/50 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <NavLink to="/" className="group flex items-center gap-2.5 leading-tight">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/12 to-secondary/12 p-2 text-primary shadow-soft ring-1 ring-border transition-colors group-hover:from-primary/20 group-hover:to-secondary/20">
            <LogoMark />
          </span>
          <span className="flex flex-col">
            <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Nor Haji Osman
            </span>
            <span className="whitespace-nowrap font-display text-base text-foreground sm:text-lg">
              Public Health Leader
            </span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <ThemeToggle className="ml-1" />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;
