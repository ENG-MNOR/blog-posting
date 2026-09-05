import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import RoleRoute from '@/components/common/RoleRoute';

import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import ResearchPage from '@/pages/public/ResearchPage';
import EventsPage from '@/pages/public/EventsPage';
import ContactPage from '@/pages/public/ContactPage';
import NotFoundPage from '@/pages/public/NotFoundPage';

import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import ResearchManagerPage from '@/pages/admin/ResearchManagerPage';
import EventManagerPage from '@/pages/admin/EventManagerPage';
import ContentManagerPage from '@/pages/admin/ContentManagerPage';
import MessageCenterPage from '@/pages/admin/MessageCenterPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import UserManagerPage from '@/pages/admin/UserManagerPage';

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
  { path: '/admin/login', element: <AdminLoginPage /> },

  // Authenticated admin area
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'research', element: <ResearchManagerPage /> },
          { path: 'events', element: <EventManagerPage /> },
          { path: 'content', element: <ContentManagerPage /> },
          { path: 'messages', element: <MessageCenterPage /> },
          { path: 'settings', element: <SettingsPage /> },
          {
            element: <RoleRoute role="admin" />,
            children: [{ path: 'users', element: <UserManagerPage /> }],
          },
        ],
      },
    ],
  },
]);

export default router;
