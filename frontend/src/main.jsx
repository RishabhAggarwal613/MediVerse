import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import QueryProvider from './app/providers/QueryProvider.jsx';
import ThemeProvider from './app/providers/ThemeProvider.jsx';
import { store } from './store/index.js';
import router from './app/routes.jsx';
import FullScreenLoader from '@/components/ui/FullScreenLoader.jsx';

import './styles/index.css';
import './i18n/index.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryProvider>
        <ThemeProvider>
          <Suspense fallback={<FullScreenLoader />}>
            <RouterProvider router={router} />
          </Suspense>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  </StrictMode>
);
