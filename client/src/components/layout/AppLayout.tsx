import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};

export default AppLayout;





