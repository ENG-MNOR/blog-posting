// import { createBrowserRouter, Navigate } from 'react-router-dom';
// import AppLayout from '@/components/layout/AppLayout';
// import AdminLayout from '@/components/layout/AdminLayout';
// import ProtectedRoute from '@/components/common/ProtectedRoute';
// import HomePage from '@/pages/public/HomePage';
// import AboutPage from '@/pages/public/AboutPage';
// import ResearchPage from '@/pages/public/ResearchPage';
// import EventsPage from '@/pages/public/EventsPage';
// import ContactPage from '@/pages/public/ContactPage';
// import AdminLoginPage from '@/pages/admin/AdminLoginPage';
// import DashboardPage from '@/pages/admin/DashboardPage';
// import ResearchManagerPage from '@/pages/admin/ResearchManagerPage';
// import EventManagerPage from '@/pages/admin/EventManagerPage';
// import ContentManagerPage from '@/pages/admin/ContentManagerPage';
// import MessageCenterPage from '@/pages/admin/MessageCenterPage';

// const router = createBrowserRouter([
//   {
//     element: <AppLayout />,
//     children: [
//       { path: '/', element: <HomePage /> },
//       { path: '/about', element: <AboutPage /> },
//       { path: '/research', element: <ResearchPage /> },
//       { path: '/events', element: <EventsPage /> },
//       { path: '/contact', element: <ContactPage /> }
//     ]
//   },
//   {
//     path: '/admin',
//     element: <AdminLayout />,
//     children: [
//       { index: true, element: <Navigate to="login" replace /> },
//       { path: 'login', element: <AdminLoginPage /> },
//       {
//         element: <ProtectedRoute />,
//         children: [
//           { path: 'dashboard', element: <DashboardPage /> },
//           { path: 'research', element: <ResearchManagerPage /> },
//           { path: 'events', element: <EventManagerPage /> },
//           { path: 'content', element: <ContentManagerPage /> },
//           { path: 'messages', element: <MessageCenterPage /> }
//         ]
//       }
//     ]
//   },
//   { path: '*', element: <Navigate to="/" replace /> }
// ]);

// export default router;


import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';

// import AdminLayout from '@/layout/AdminLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import ResearchPage from '@/pages/public/ResearchPage';
import EventsPage from '@/pages/public/EventsPage';
import ContactPage from '@/pages/public/ContactPage';

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
    ],
  },

  // ✅ login route (NO sidebar)
  { path: '/admin/login', element: <AdminLoginPage /> },

  // ✅ protected admin routes (WITH sidebar)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'research', element: <ResearchManagerPage /> },
          { path: 'events', element: <EventManagerPage /> },
          { path: 'content', element: <ContentManagerPage /> },
          { path: 'messages', element: <MessageCenterPage /> },
          { path: 'users', element: <UserManagerPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ]
      }
    ]
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
