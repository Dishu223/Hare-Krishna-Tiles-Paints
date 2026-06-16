import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { usePaintMode } from './PaintModeContext';


interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  scale: number;
}

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { isPaintMode } = usePaintMode();
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for outer ring and inner dot
  const outerSpringConfig = { damping: 30, stiffness: 200, mass: 0.8 };
  const innerSpringConfig = { damping: 20, stiffness: 400, mass: 0.2 };
  
  const outerX = useSpring(mouseX, outerSpringConfig);
  const outerY = useSpring(mouseY, outerSpringConfig);
  
  const innerX = useSpring(mouseX, innerSpringConfig);
  const innerY = useSpring(mouseY, innerSpringConfig);

  const particleIdRef = useRef(0);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    // Only show custom cursor on non-touch devices and larger screens
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) return;
    
    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const now = Date.now();
      // Emit a particle every 40ms to keep it performant but dense
      if (now - lastEmitRef.current > 40) {
        lastEmitRef.current = now;
        
        const newParticle: Particle = {
          id: particleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          angle: Math.random() * Math.PI * 2,
          distance: 10 + Math.random() * 30, // Drift distance
          scale: 0.3 + Math.random() * 0.7 // Size variance
        };
        
        setParticles(prev => {
          // Keep max 25 particles in DOM to maintain 60fps
          const updated = [...prev, newParticle];
          if (updated.length > 25) return updated.slice(updated.length - 25);
          return updated;
        });

        // Clean up the particle after animation finishes (1000ms)
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 1000);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isVisible || isPaintMode) return null;

  return (
    <>
      <style>{`
        /* Hide default cursor on desktop when custom cursor is active */
        @media (pointer: fine) {
          body {
            cursor: none;
          }
          a, button, .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>
      
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-divine-gold pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(212,168,67,0.4)]"
        style={{
          x: outerX,
          y: outerY,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(212, 168, 67, 0.15)' : 'rgba(212, 168, 67, 0)',
          borderColor: isHovering ? '#f3d688' : '#d4a843',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />

      {/* Particle Emitter */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y, 
              scale: 0, 
              opacity: 1 
            }}
            animate={{ 
              x: p.x + Math.cos(p.angle) * p.distance, 
              y: p.y + Math.sin(p.angle) * p.distance,
              scale: isHovering ? 0 : p.scale,
              opacity: 0 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="fixed top-0 left-0 w-2 h-2 rounded-full bg-divine-gold pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#d4a843]"
          />
        ))}
      </AnimatePresence>

      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-divine-gold pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_#d4a843]"
        style={{
          x: innerX,
          y: innerY,
        }}
        animate={{
          scale: isHovering ? 0.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
