import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { X } from 'lucide-react';
import { Product } from '../types';

export function Lightbox({ product, onClose }: { product: Product; onClose: () => void }) {
  // Prevent scrolling when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 3D Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!e.touches[0]) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (touch.clientX - rect.left) / rect.width - 0.5;
    const py = (touch.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
      onClick={onClose}
      style={{ perspective: '1500px' }}
      data-lenis-prevent="true"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-[1000] p-3 rounded-full bg-white/20 md:bg-white/10 text-white hover:bg-white/30 backdrop-blur-md transition-colors cursor-pointer border border-white/20"
      >
        <X size={24} />
      </button>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative max-w-5xl w-full max-h-full flex flex-col items-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl transform-gpu"
            style={{ transform: 'translateZ(60px)' }}
          />
        </div>
        <div className="mt-6 text-center transform-gpu" style={{ transform: 'translateZ(40px)' }}>
          <span className="text-divine-gold uppercase tracking-widest text-xs font-semibold">
            {product.category}
          </span>
          <h2 className="text-3xl font-serif text-white mt-2">{product.name}</h2>
          <p className="text-white/60 font-sans mt-3 max-w-2xl mx-auto leading-relaxed">
            {product.description}
          </p>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
