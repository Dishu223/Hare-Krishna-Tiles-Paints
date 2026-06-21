import {StrictMode, lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { SmoothScroll } from './components/SmoothScroll.tsx';
import { SoundProvider } from './components/SoundProvider.tsx';
import { PaintModeProvider } from './components/PaintModeContext.tsx';
import { AdminDataProvider } from './components/admin/AdminDataContext.tsx';

const Admin = lazy(() => import('./components/Admin.tsx').then(module => ({ default: module.Admin })));

const rootElement = document.getElementById('root')!;
const queryParams = new URLSearchParams(window.location.search);
const isAdminRoute = queryParams.has('admin') || queryParams.get('admin') === 'true' || window.location.hash.includes('admin=true');

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <AdminDataProvider>
        {isAdminRoute ? (
          <Suspense fallback={<div className="min-h-screen bg-deep-black flex items-center justify-center text-white font-sans">Loading Admin Interface...</div>}>
            <Admin />
          </Suspense>
        ) : (
          <PaintModeProvider>
            <SoundProvider>
              <SmoothScroll>
                <App />
              </SmoothScroll>
            </SoundProvider>
          </PaintModeProvider>
        )}
      </AdminDataProvider>
    </ThemeProvider>
  </StrictMode>
);
