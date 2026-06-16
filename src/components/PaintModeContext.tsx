import React, { createContext, useContext, useState, useEffect } from 'react';

interface PaintModeContextType {
  isPaintMode: boolean;
  togglePaintMode: () => void;
  setPaintMode: (active: boolean) => void;
}

const PaintModeContext = createContext<PaintModeContextType | undefined>(undefined);

export function PaintModeProvider({ children }: { children: React.ReactNode }) {
  const [isPaintMode, setIsPaintMode] = useState(false);

  // You can also sync this with localStorage if you want it to persist
  // useEffect(() => {
  //   const saved = localStorage.getItem('hk_paint_mode');
  //   if (saved) setIsPaintMode(saved === 'true');
  // }, []);

  useEffect(() => {
    if (isPaintMode) {
      document.body.classList.add('paint-mode-active');
    } else {
      document.body.classList.remove('paint-mode-active');
    }
  }, [isPaintMode]);

  const togglePaintMode = () => setIsPaintMode(prev => !prev);
  const setPaintMode = (active: boolean) => setIsPaintMode(active);

  return (
    <PaintModeContext.Provider value={{ isPaintMode, togglePaintMode, setPaintMode }}>
      {children}
    </PaintModeContext.Provider>
  );
}

export function usePaintMode() {
  const context = useContext(PaintModeContext);
  if (context === undefined) {
    throw new Error('usePaintMode must be used within a PaintModeProvider');
  }
  return context;
}
