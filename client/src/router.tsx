import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import RoleRoute from '@/components/common/RoleRoute';
import { LoadingScreen } from '@/components/ui/spinner';

import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import ResearchPage from '@/pages/public/ResearchPage';
import EventsPage from '@/pages/public/EventsPage';
import ContactPage from '@/pages/public/ContactPage';
import NotFoundPage from '@/pages/public/NotFoundPage';

// Admin bundle is code-split — visitors never download it.
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const ResearchManagerPage = lazy(() => import('@/pages/admin/ResearchManagerPage'));
const EventManagerPage = lazy(() => import('@/pages/admin/EventManagerPage'));
const ContentManagerPage = lazy(() => import('@/pages/admin/ContentManagerPage'));
const MessageCenterPage = lazy(() => import('@/pages/admin/MessageCenterPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
const UserManagerPage = lazy(() => import('@/pages/admin/UserManagerPage'));

const lazyPage = (node: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{node}</Suspense>
);

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/research', element: <ResearchPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Admin login — standalone, no chrome
  { path: '/admin/login', element: lazyPage(<AdminLoginPage />) },

  // Authenticated admin area
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: lazyPage(<DashboardPage />) },
          { path: 'research', element: lazyPage(<ResearchManagerPage />) },
          { path: 'events', element: lazyPage(<EventManagerPage />) },
          { path: 'content', element: lazyPage(<ContentManagerPage />) },
          { path: 'messages', element: lazyPage(<MessageCenterPage />) },
          { path: 'settings', element: lazyPage(<SettingsPage />) },
          {
            element: <RoleRoute role="admin" />,
            children: [{ path: 'users', element: lazyPage(<UserManagerPage />) }],
          },
        ],
      },
    ],
  },
]);

export default router;
