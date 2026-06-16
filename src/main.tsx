import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { SmoothScroll } from './components/SmoothScroll.tsx';
import { SoundProvider } from './components/SoundProvider.tsx';
import { Admin } from './components/Admin.tsx';
import { PaintModeProvider } from './components/PaintModeContext.tsx';

import { AdminDataProvider } from './components/admin/AdminDataContext.tsx';

const rootElement = document.getElementById('root')!;
const isAdminRoute = window.location.pathname === '/admin';

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <AdminDataProvider>
        {isAdminRoute ? (
          <Admin />
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
