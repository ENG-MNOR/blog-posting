import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { LoadingScreen } from '@/components/ui/spinner';

const ProtectedRoute = () => {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refresh = useAuthStore((s) => s.refresh);

  // Attempt a silent refresh once on entry (relies on the httpOnly cookie).
  useEffect(() => {
    if (!accessToken && status === 'idle') {
      void refresh();
    }
  }, [accessToken, status, refresh]);

  if (status === 'loading' || (status === 'idle' && !accessToken)) {
    return <LoadingScreen label="Checking your session…" />;
  }

  if (status !== 'authenticated' || !accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
