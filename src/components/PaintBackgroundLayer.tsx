import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePaintMode } from './PaintModeContext';
import Grainient from './Grainient';

interface PaintBackgroundLayerProps {
  containerRef: React.RefObject<HTMLElement>;
  colors?: string[]; // Kept for compatibility but we use a unified fluid gradient now
}

export function PaintBackgroundLayer({ containerRef }: PaintBackgroundLayerProps) {
  const { isPaintMode } = usePaintMode();
  
  return (
    <AnimatePresence>
      {isPaintMode && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 1 }}
          className="sticky top-0 w-full h-[100dvh] overflow-hidden pointer-events-none z-0"
        >
          {/* Base fluid background */}
          <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
            <Grainient
              randomizeColors={true}
              colorChangeSpeed={0.01}
              timeSpeed={0.2}
              colorBalance={0.0}
              warpStrength={1.5}
              warpFrequency={3.0}
              warpSpeed={1.5}
              warpAmplitude={60.0}
              blendAngle={45.0}
              blendSoftness={0.2}
              rotationAmount={200.0}
              noiseScale={1.5}
              grainAmount={0.05}
              grainScale={1.5}
              grainAnimated={true}
              contrast={1.1}
              gamma={1.0}
              saturation={1.3}
              centerX={0.0}
              centerY={0.0}
              zoom={1.0}
              className="w-full h-full scale-110 opacity-40 dark:opacity-30"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
