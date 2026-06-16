import React from 'react';
import { usePaintMode } from './PaintModeContext';
import FluidCursor from './FluidCursor';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';

export function GlobalPaintOverlay() {
  const { isPaintMode } = usePaintMode();

  if (!isPaintMode) return null;

  return (
    <>
      <PaintBackgroundLayer containerRef={{ current: document.body }} />
      {/* Dynamic WebGL Fluid Cursor Effect */}
      <FluidCursor />
    </>
  );
}
