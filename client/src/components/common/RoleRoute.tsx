import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import type { UserRole } from '@/types';

/** Guards nested routes behind a required role. Assumes ProtectedRoute ran first. */
const RoleRoute = ({ role }: { role: UserRole }) => {
  const user = useAuthStore((s) => s.user);
  if (user && user.role !== role) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
