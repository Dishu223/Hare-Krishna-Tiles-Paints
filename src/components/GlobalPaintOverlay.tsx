import React, { useState, useEffect } from 'react';
import { usePaintMode } from './PaintModeContext';
import FluidCursor from './FluidCursor';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';

export function GlobalPaintOverlay() {
  const { isPaintMode } = usePaintMode();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
  }, []);

  if (!isPaintMode) return null;

  return (
    <>
      <PaintBackgroundLayer containerRef={{ current: document.body }} />
      {/* Dynamic WebGL Fluid Cursor Effect */}
      {!isMobile && <FluidCursor />}
    </>
  );
}
