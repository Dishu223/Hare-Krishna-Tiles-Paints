import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useSound } from './SoundProvider';
import { usePaintMode } from './PaintModeContext';

export function GlobalJourney() {
  const [metrics, setMetrics] = useState({
    p0: {x: 0, y: 0},
    p1: {x: 0, y: 0},
    p2: {x: 0, y: 0},
    p3: {x: 0, y: 0},
    p4: {x: 0, y: 0},
    p5: {x: 0, y: 0},
    p6: {x: 0, y: 0},
    scrollStops: [0, 0, 0, 0, 0, 0, 0],
    geomStops: [0, 0, 0, 0, 0, 0, 0],
    pathString: '',
    ready: false
  });

  const [clickCount, setClickCount] = useState(0);
  const { playClickSound } = useSound();
  const { scrollY } = useScroll();
  const { isPaintMode } = usePaintMode();

  useEffect(() => {
    const updateMetrics = () => {
      const startEl = document.getElementById('journey-start');
      const testEl = document.getElementById('testimonials-start');
      const aboutEl = document.getElementById('about-us-start');
      const endEl = document.getElementById('journey-end');

      if (!startEl || !testEl || !aboutEl || !endEl) return;

      const scrollOffset = window.scrollY;
      const isMobile = window.innerWidth < 768;

      const startY = startEl.getBoundingClientRect().top + scrollOffset + startEl.getBoundingClientRect().height / 2;
      const testY = testEl.getBoundingClientRect().top + scrollOffset + (isMobile ? 40 : 100);
      const aboutY = aboutEl.getBoundingClientRect().top + scrollOffset + (isMobile ? 40 : 100);
      const endY = endEl.getBoundingClientRect().top + scrollOffset + endEl.getBoundingClientRect().height / 2;

      const startX = isMobile ? 24 : Math.max(32, window.innerWidth * 0.04);
      const rightX = window.innerWidth - startX;
      const endX = endEl.getBoundingClientRect().left - 24;

      const p0 = { x: startX, y: startY };
      const p1 = { x: startX, y: testY };
      const p2 = { x: rightX, y: testY };
      const p3 = { x: rightX, y: aboutY };
      const p4 = { x: startX, y: aboutY };
      const p5 = { x: startX, y: endY };
      const p6 = { x: endX, y: endY };

      const l1 = testY - startY;
      const l2 = rightX - startX;
      const l3 = aboutY - testY;
      const l4 = rightX - startX;
      const l5 = endY - aboutY;
      const l6 = endX - startX;

      const totalLength = l1 + l2 + l3 + l4 + l5 + l6;
      
      const geomStops = [
        0,
        l1 / totalLength,
        (l1 + l2) / totalLength,
        (l1 + l2 + l3) / totalLength,
        (l1 + l2 + l3 + l4) / totalLength,
        (l1 + l2 + l3 + l4 + l5) / totalLength,
        1
      ];

      const pathString = `M ${p0.x},${p0.y} L ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} L ${p5.x},${p5.y} L ${p6.x},${p6.y}`;

      const OFFSET = window.innerHeight * 0.6;
      const H_SCROLL = 250; // pixels to scroll while moving horizontally

      // Calculate perfect scroll mapping to keep feather in viewport at all times
      const s0 = startY - OFFSET;
      const s1 = testY - Math.max(H_SCROLL, OFFSET);
      const s2 = s1 + H_SCROLL;
      const s3 = Math.max(s2 + 100, aboutY - Math.max(H_SCROLL, OFFSET));
      const s4 = s3 + H_SCROLL;
      const s5 = Math.max(s4 + 100, endY - Math.max(H_SCROLL, OFFSET));
      const s6 = s5 + H_SCROLL;

      setMetrics({
        p0, p1, p2, p3, p4, p5, p6,
        scrollStops: [s0, s1, s2, s3, s4, s5, s6],
        geomStops,
        pathString,
        ready: true
      });
    };

    updateMetrics();
    const t1 = setTimeout(updateMetrics, 500);
    const t2 = setTimeout(updateMetrics, 1500);
    const t3 = setTimeout(updateMetrics, 3000);

    const resizeObserver = new ResizeObserver(() => updateMetrics());
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    window.addEventListener('resize', updateMetrics);
    return () => {
      window.removeEventListener('resize', updateMetrics);
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const pathProgress = useTransform(
    scrollY,
    metrics.scrollStops,
    metrics.geomStops,
    { clamp: true }
  );

  const featherX = useTransform(
    scrollY,
    metrics.scrollStops,
    [metrics.p0.x, metrics.p1.x, metrics.p2.x, metrics.p3.x, metrics.p4.x, metrics.p5.x, metrics.p6.x],
    { clamp: true }
  );
  
  const featherY = useTransform(
    scrollY,
    metrics.scrollStops,
    [metrics.p0.y, metrics.p1.y, metrics.p2.y, metrics.p3.y, metrics.p4.y, metrics.p5.y, metrics.p6.y],
    { clamp: true }
  );

  const handleFeatherClick = () => {
    setClickCount(prev => prev + 1);
    playClickSound();
  };

  if (!metrics.ready) return null;

  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    angle: (i * 30 * Math.PI) / 180,
    distance: 40 + Math.random() * 40,
    scale: 0.5 + Math.random() * 0.5,
  }));

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 overflow-hidden">
      <svg className="absolute top-0 left-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient id="paint-trail" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="33%" stopColor="#a855f7" />
            <stop offset="66%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        <path
          d={metrics.pathString}
          fill="none"
          stroke={isPaintMode ? "rgba(236, 72, 153, 0.15)" : "rgba(212, 168, 67, 0.15)"}
          strokeWidth={isPaintMode ? 6 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d={metrics.pathString}
          fill="none"
          stroke={isPaintMode ? "url(#paint-trail)" : "rgba(212, 168, 67, 1)"}
          strokeWidth={isPaintMode ? 6 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: pathProgress }}
          className={isPaintMode ? 'drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' : ''}
        />
      </svg>

      <motion.div
        style={{ x: featherX, y: featherY }}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
        onClick={handleFeatherClick}
      >
        {/* The icon container */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className={`relative z-50 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 backdrop-blur-md rounded-full shadow-xl select-none overflow-hidden p-2 ${isPaintMode ? 'bg-pink-500/80 border-2 border-white drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]' : 'drop-shadow-[0_0_15px_rgba(212,168,67,0.8)] bg-royal-purple/80 border border-divine-gold/40'}`}
        >
          <img src="/feather_icon.png" alt="Feather Icon" loading="lazy" decoding="async" className={`w-full h-full object-contain pointer-events-none drop-shadow-md transition-all ${isPaintMode ? 'animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`} />
        </motion.div>

        {/* ── Click Burst Effect ── */}
        <AnimatePresence>
          {clickCount > 0 && (
            <motion.div
              key={clickCount}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              {/* Particles */}
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  animate={{ 
                    x: Math.cos(p.angle) * p.distance, 
                    y: Math.sin(p.angle) * p.distance,
                    scale: [0, p.scale, 0],
                    opacity: [1, 1, 0] 
                  }}
                  transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.7, 1] }}
                  className={`absolute top-0 left-0 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isPaintMode ? 'bg-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'bg-divine-gold shadow-[0_0_10px_rgba(212,168,67,0.8)]'}`}
                  style={{ originX: 0.5, originY: 0.5 }}
                />
              ))}

              {/* Floating Text */}
              <motion.div
                animate={{ 
                  y: [-20, -60, -80], 
                  opacity: [0, 1, 0], 
                  scale: [0.5, 1, 0.8] 
                }}
                transition={{ duration: 2.5, ease: "easeOut", times: [0, 0.2, 1] }}
                className={`absolute left-6 translate-x-0 md:left-1/2 md:-translate-x-1/2 bottom-full mb-4 whitespace-nowrap font-serif text-sm md:text-xl font-semibold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${isPaintMode ? 'text-white' : 'text-divine-gold'}`}
              >
                Radhe Radhe! 🦚
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
