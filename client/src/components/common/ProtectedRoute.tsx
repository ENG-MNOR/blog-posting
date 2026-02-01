
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

const ProtectedRoute = () => {
  const location = useLocation();

  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refresh = useAuthStore((s) => s.refresh);

  // Try refresh once when entering protected routes
  useEffect(() => {
    if (!accessToken && status === 'idle') {
      refresh();
    }
  }, [accessToken, status, refresh]);

  if (status === 'loading' || (status === 'idle' && !accessToken)) {
    return <p className="p-8 text-center text-slate-500">Checking session...</p>;
  }

  // Not authenticated
  if (status !== 'authenticated' || !accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
