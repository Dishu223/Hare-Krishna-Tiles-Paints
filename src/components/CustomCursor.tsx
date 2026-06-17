import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { usePaintMode } from './PaintModeContext';

interface Splash {
  id: number;
  x: number;
  y: number;
  color: string;
}

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
  const [isHeroHovering, setIsHeroHovering] = useState(false);
  const isHeroHoveringRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const { isPaintMode } = usePaintMode();
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for outer ring and inner dot
  const outerSpringConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const innerSpringConfig = { damping: 20, stiffness: 400, mass: 0.2 };
  
  const outerX = useSpring(mouseX, outerSpringConfig);
  const outerY = useSpring(mouseY, outerSpringConfig);
  
  const innerX = useSpring(mouseX, innerSpringConfig);
  const innerY = useSpring(mouseY, innerSpringConfig);

  const particleIdRef = useRef(0);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    // Determine if device is mobile/touch
    const isMobileDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    
    // Prevent the custom cursor from ever showing on mobile
    if (!isMobileDevice) {
      setIsVisible(true);
    }

    const moveCursor = (e: MouseEvent) => {
      if (isMobileDevice) return; // Prevent any processing on mobile
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isPaintMode || isHeroHoveringRef.current) {
        const now = Date.now();
        if (now - lastEmitRef.current > 50) {
          lastEmitRef.current = now;
          
          const isHero = isHeroHoveringRef.current;
          
          const newParticle: Particle = {
            id: particleIdRef.current++,
            x: e.clientX,
            y: e.clientY,
            angle: Math.random() * Math.PI * 2,
            distance: 10 + Math.random() * 25,
            scale: isHero ? (0.2 + Math.random() * 0.4) : (0.5 + Math.random() * 1.0)
          };
          
          setParticles(prev => {
            const updated = [...prev, newParticle];
            if (updated.length > 20) return updated.slice(updated.length - 20);
            return updated;
          });

          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== newParticle.id));
          }, 800);
        }
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
        setIsHeroHovering(false);
        isHeroHoveringRef.current = false;
      } else if (target.closest('[data-cursor="hero"]')) {
        setIsHovering(false);
        setIsHeroHovering(true);
        isHeroHoveringRef.current = true;
      } else {
        setIsHovering(false);
        setIsHeroHovering(false);
        isHeroHoveringRef.current = false;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor="hero"]')) return;
      const colors = ['#ec4899', '#06b6d4', '#eab308', '#22c55e', '#f97316', '#8b5cf6'];
      const newSplash = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setSplashes(prev => [...prev, newSplash]);
      setTimeout(() => {
        setSplashes(prev => prev.filter(s => s.id !== newSplash.id));
      }, 600);
    };

    // Use touchstart for mobile splashes
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor="hero"]')) return;
      const touch = e.touches[0];
      const colors = ['#ec4899', '#06b6d4', '#eab308', '#22c55e', '#f97316', '#8b5cf6'];
      const newSplash = {
        id: Date.now() + Math.random(),
        x: touch.clientX,
        y: touch.clientY,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setSplashes(prev => [...prev, newSplash]);
      setTimeout(() => {
        setSplashes(prev => prev.filter(s => s.id !== newSplash.id));
      }, 600);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mouseX, mouseY, isPaintMode]);

  return (
    <>
      {/* ── Paint Splashes (Rendered unconditionally everywhere) ── */}
      <AnimatePresence>
        {splashes.map(s => (
          <motion.div
            key={s.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed w-16 h-16 rounded-full pointer-events-none z-[0] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
            style={{ 
              left: s.x, 
              top: s.y, 
              backgroundColor: s.color,
              filter: 'blur(8px)'
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Custom Mouse Cursor ── */}
      {isVisible && (!isPaintMode || isHeroHovering) && (
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
          
          {/* Sparkles Emitter */}
          <AnimatePresence>
            {particles.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: p.x, y: p.y, scale: p.scale, opacity: 1 }}
                animate={{ 
                  x: p.x + Math.cos(p.angle) * p.distance, 
                  y: p.y - 20 + Math.sin(p.angle) * p.distance,
                  scale: 0,
                  opacity: 0 
                }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-[#fceba1] pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(212,168,67,0.8)]"
              />
            ))}
          </AnimatePresence>

          {/* Aesthetic Outer Ring */}
          <motion.div
            className="fixed top-0 left-0 w-10 h-10 rounded-full border pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 backdrop-blur-[2px]"
            style={{
              x: outerX,
              y: outerY,
            }}
            animate={{
              scale: isHeroHovering ? 2.2 : (isHovering ? 1.5 : 1),
              backgroundColor: isHeroHovering ? 'rgba(212, 168, 67, 0.1)' : (isHovering ? 'rgba(212, 168, 67, 0.05)' : 'rgba(255, 255, 255, 0)'),
              borderColor: isHeroHovering ? 'rgba(212, 168, 67, 0.5)' : (isHovering ? 'rgba(212, 168, 67, 0.8)' : 'rgba(212, 168, 67, 0.3)'),
              borderWidth: '1px',
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />

          {/* Hero Scroll Text */}
          <AnimatePresence>
            {isHeroHovering && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{ x: outerX, y: outerY }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
              >
                <span className="text-[0.45rem] font-sans tracking-[0.2em] text-divine-gold font-bold uppercase drop-shadow-[0_0_5px_rgba(212,168,67,0.8)]">
                  Scroll
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Elegant Inner Dot */}
          <motion.div
            className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#d4a843]"
            style={{
              x: innerX,
              y: innerY,
              backgroundColor: '#d4a843'
            }}
            animate={{
              scale: (isHovering || isHeroHovering) ? 0 : 1,
              opacity: (isHovering || isHeroHovering) ? 0 : 1
            }}
            transition={{ duration: 0.15 }}
          />
        </>
      )}
    </>
  );
}
