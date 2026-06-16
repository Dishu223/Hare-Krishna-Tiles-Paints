import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Eye, IndianRupee, Box, Maximize2 } from 'lucide-react';
import { Product } from '../types';
import { Lightbox } from './Lightbox';
import { useAdminData } from './admin/AdminDataContext';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onVisualize: () => void;
}

export function ProductDrawer({ isOpen, onClose, product, onVisualize }: ProductDrawerProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { settings } = useAdminData();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!product) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hi, I'm interested in the ${product.name} from your collection. Could you provide more details?`);
    window.open(`https://wa.me/919897665060?text=${text}`, '_blank');
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[115]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] lg:w-[500px] bg-white/95 dark:bg-deep-black/95 backdrop-blur-3xl z-[120] border-l border-royal-purple/10 dark:border-white/10 flex flex-col shadow-2xl"
            data-lenis-prevent="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
              <span className="text-xs uppercase tracking-widest text-royal-purple dark:text-divine-gold font-bold bg-royal-purple/5 dark:bg-divine-gold/10 px-3 py-1 rounded-full border border-royal-purple/10 dark:border-divine-gold/20">
                {product.category}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-royal-purple dark:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
              {/* Main Image with Lightbox Trigger */}
              <div 
                className="relative h-72 sm:h-80 w-full bg-cream dark:bg-black group cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center font-serif text-2xl text-gray-400 dark:text-white/20">No Image</div>';
                  }}
                />
                
                {/* Expand Icon */}
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/40 backdrop-blur-md p-2 rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-md">
                  <Maximize2 size={16} />
                </div>

              </div>

              {/* Details & Specs - Compact Layout */}
              <div className="bg-gray-50/80 dark:bg-white/5 border border-royal-purple/10 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-royal-purple/5 dark:bg-divine-gold/5 blur-[40px] rounded-full pointer-events-none" />
                <h2 className="font-serif text-2xl md:text-3xl text-royal-purple dark:text-white mb-2 relative z-10">{product.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-white/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-divine-gold" />
                    <span className="text-gray-900 dark:text-white font-semibold text-lg">
                      {product.price?.toLocaleString('en-IN') || 'Price on request'}
                      {product.unit && <span className="text-sm font-medium text-gray-500 dark:text-white/60 ml-1">{product.unit}</span>}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200 dark:bg-white/10 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-divine-gold" />
                    <span className="text-gray-700 dark:text-white/80 text-sm font-medium">Premium Quality</span>
                  </div>
                  
                  {/* Stock Status Indicator */}
                  <div className="w-full md:w-auto mt-2 md:mt-0 flex items-center">
                    {(product.stockCount === 0 || product.stockCount === undefined) ? (
                      <span className="text-xs font-bold tracking-widest uppercase bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-500/30">
                        Out of Stock
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-widest uppercase bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-500/30 shadow-sm">
                          {settings.showStockCount ? `In Stock (${product.stockCount})` : 'In Stock'}
                        </span>
                        {product.stockCount <= settings.lowStockThreshold && (
                          <span className="text-[0.65rem] font-bold tracking-widest uppercase text-yellow-600 dark:text-yellow-500 animate-pulse">
                            (Few Remaining)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Advanced Specs */}
                {(product.advanced?.size || product.advanced?.color || product.advanced?.dimensions) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-white/10 relative z-10">
                    {product.advanced?.size && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/50 uppercase tracking-widest mb-0.5">Size</span>
                        <span className="text-sm text-gray-800 dark:text-white font-medium">{product.advanced.size}</span>
                      </div>
                    )}
                    {product.advanced?.color && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/50 uppercase tracking-widest mb-0.5">Color</span>
                        <span className="text-sm text-gray-800 dark:text-white font-medium">{product.advanced.color}</span>
                      </div>
                    )}
                    {product.advanced?.dimensions && (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/50 uppercase tracking-widest mb-0.5">Dimensions</span>
                        <span className="text-sm text-gray-800 dark:text-white font-medium">{product.advanced.dimensions}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="font-sans text-gray-600 dark:text-white/70 leading-relaxed text-sm relative z-10 font-medium">
                  {product.description || "A premium choice for your space, crafted with excellence and extreme care for detail."}
                </p>
              </div>
            </div>

            {/* Footer / CTA */}
            <div className="p-6 border-t border-white/10 bg-black/20">
              <button
                onClick={handleWhatsApp}
                className="w-full btn-gold-shimmer py-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(212,168,67,0.2)]"
              >
                <MessageCircle className="w-5 h-5" />
                Enquire on WhatsApp
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {isLightboxOpen && (
              <Lightbox product={product} onClose={() => setIsLightboxOpen(false)} />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  , typeof document !== 'undefined' ? document.body : null as any);
}
