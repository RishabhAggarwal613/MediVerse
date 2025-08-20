// src/app/routes.jsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ProtectedRoute from './guards/ProtectedRoute.jsx';
import FullScreenLoader from '@/components/ui/FullScreenLoader.jsx';

// Lazy pages (code-split)
const Home = lazy(() => import('@/pages/Home/index.jsx'));
const MediAI = lazy(() => import('@/pages/MediAI/index.jsx'));
const ReportScanner = lazy(() => import('@/pages/ReportScanner/index.jsx'));
const Wearables = lazy(() => import('@/pages/Wearables/index.jsx'));
const DietPlanner = lazy(() => import('@/pages/DietPlanner/index.jsx'));
const Dashboard = lazy(() => import('@/pages/Dashboard/index.jsx'));
const Profile = lazy(() => import('@/pages/Profile/index.jsx'));
const Login = lazy(() => import('@/pages/Auth/Login.jsx'));
const Signup = lazy(() => import('@/pages/Auth/Signup.jsx'));

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-semibold">404 — Page not found</h1>
      <p className="mt-2 text-gray-400">The page you’re looking for doesn’t exist.</p>
    </div>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <App />,
      children: [
        { index: true, element: <Home /> },

        // Auth
        { path: 'auth/login', element: <Login /> },
        { path: 'auth/signup', element: <Signup /> },

        // Protected app routes
        {
          element: <ProtectedRoute />,
          children: [
            { path: 'medi-ai', element: <MediAI /> },
            { path: 'report-scanner', element: <ReportScanner /> },
            { path: 'wearables', element: <Wearables /> },
            { path: 'diet-planner', element: <DietPlanner /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'profile', element: <Profile /> },
          ],
        },

        // 404
        { path: '*', element: <NotFound /> },
      ],
      // simple route-level pending fallback
      loading: <FullScreenLoader />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

export default router;
