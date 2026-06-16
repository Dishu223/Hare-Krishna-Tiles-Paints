import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import ShinyText from './ShinyText';
import CountUp from './CountUp';
import { usePaintMode } from './PaintModeContext';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';

interface HeroProps {
  onExplore: () => void;
}

const FRAME_COUNT = 60;

const getImagePath = (index: number) => {
  const num = index.toString().padStart(3, '0');
  return `/SHOWROOM_UPGRADED/Animate_shop_lights_flicker_open_202606160205_${num}.jpg`;
};

export function Hero({ onExplore }: HeroProps) {
  const { isPaintMode } = usePaintMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [countFinished, setCountFinished] = useState(false);
  const [imagesFinished, setImagesFinished] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [isFadingOutLoading, setIsFadingOutLoading] = useState(false);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getImagePath(i);
      img.onload = () => {
        loadedCount++;
        loadedImages[i] = img;
        if (loadedCount === FRAME_COUNT) {
          setImages(loadedImages);
          setImagesFinished(true);
        }
      };
    }
  }, []);

  // Handle loading overlay transition
  useEffect(() => {
    if (countFinished && imagesFinished) {
      setIsFadingOutLoading(true);
      setTimeout(() => setShowLoadingOverlay(false), 800); // Wait for fade out animation
    }
  }, [countFinished, imagesFinished]);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // By ending when the bottom of container hits the TOP of viewport, 
    // the final frames play while the container is scrolling away off-screen!
    offset: ["start start", "end start"]
  });

  // Fade out animation smoothly before reaching the end
  const opacity = useTransform(scrollYProgress, [0.65, 0.9], [1, 0]);

  // Canvas drawing function
  const drawImage = (index: number) => {
    if (!canvasRef.current || images.length !== FRAME_COUNT) return;
    const img = images[index];
    if (!img) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    const isPortrait = canvas.width < canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isPortrait) {
      // Screen is narrower than landscape image (portrait / mobile)
      // 1. Draw cover background with blur
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.save();
      // Apply blur and lower brightness for a gorgeous ambient background
      ctx.filter = 'blur(40px) brightness(0.45)';
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();

      // 2. Draw contain foreground in the center (fully fitting width of canvas)
      const containWidth = canvas.width;
      const containHeight = canvas.width / imgRatio;
      const containOffsetX = 0;
      const containOffsetY = (canvas.height - containHeight) / 2;

      ctx.drawImage(img, containOffsetX, containOffsetY, containWidth, containHeight);

      // 3. Draw subtle gold lines at the top and bottom edges of the central image to frame it beautifully
      ctx.strokeStyle = 'rgba(212, 168, 67, 0.35)';
      ctx.lineWidth = Math.max(1, 1.5 * (window.devicePixelRatio || 1));
      ctx.beginPath();
      // Top line
      ctx.moveTo(containOffsetX, containOffsetY);
      ctx.lineTo(containOffsetX + containWidth, containOffsetY);
      // Bottom line
      ctx.moveTo(containOffsetX, containOffsetY + containHeight);
      ctx.lineTo(containOffsetX + containWidth, containOffsetY + containHeight);
      ctx.stroke();
    } else {
      // Landscape screen - standard clean object-cover
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        // Align image to the top instead of center to prevent ceiling/lights from being cropped out
        offsetY = 0;
      } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  };

  // Listen to scroll and update canvas
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // We animate images through the first 80% of scroll
    const progress = Math.min(1, latest / 0.8);
    const index = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    drawImage(index);
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && images.length === FRAME_COUNT) {
        // Use devicePixelRatio for sharpness
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        
        // Redraw current frame
        const latest = scrollYProgress.get();
        const progress = Math.min(1, latest / 0.8);
        const index = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
        drawImage(index);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [images, scrollYProgress]);

  return (
    <>
      {/* ── Loading Overlay ─────────────────────── */}
      {showLoadingOverlay && (
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: isFadingOutLoading ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep-black text-white pointer-events-auto"
        >
          <div className="font-serif text-6xl md:text-8xl flex items-end gap-2 text-divine-gold">
            <CountUp
              to={100}
              duration={1.5}
              onEnd={() => setCountFinished(true)}
            />
            <span className="text-2xl md:text-4xl text-divine-gold/50 mb-2">%</span>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-sans uppercase tracking-[0.3em] text-xs mt-6 text-white/50"
          >
            Loading Experience
          </motion.div>
        </motion.div>
      )}

      <section 
        ref={containerRef} 
        id="home"
        className="relative h-[300vh] md:h-[500vh] bg-deep-black" 
      >
        <motion.div 
          style={{ opacity }}
          className="sticky top-0 h-[100dvh] w-full flex items-center justify-center overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <span className="font-sans text-[0.6rem] tracking-[0.25em] uppercase text-white/90 drop-shadow-md font-medium">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-8 bg-gradient-to-b from-white to-transparent"
            />
          </div>

          <button 
            onClick={onExplore}
            className="absolute bottom-8 right-6 md:right-10 z-50 w-12 h-12 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all pointer-events-auto shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
            aria-label="Skip to Content"
          >
            <ArrowRight className="w-5 h-5 transform rotate-90" />
          </button>
        </motion.div>
      </section>
    </>
  );
}
