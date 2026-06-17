import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  AnimatePresence
} from 'motion/react';
import { Search, PackageOpen, Maximize2, Droplet } from 'lucide-react';
import { Product } from '../types';
import ShinyText from './ShinyText';
import { ProductDrawer } from './ProductDrawer';
import { RoomVisualizer } from './RoomVisualizer';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { usePaintMode } from './PaintModeContext';

import Grainient from './Grainient';
import { useAdminData } from './admin/AdminDataContext';



/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */
interface ProductsProps {
  products: Product[];
  searchQuery: string;
}

type Category = 'All' | Product['category'];

const CATEGORIES: Category[] = [
  'All',
  'Tiles',
  'Sanitaryware',
  'Bath Fittings',
  'Marble & Granite',
  'Mosaic & Accents',
];

const PAINTS_CATEGORIES = [
  'All',
  'Interior Paints',
  'Exterior Paints',
  'Enamels',
  'Primers & Putty'
];

/* ═══════════════════════════════════════════════════════
   Category icon helper — decorative unicode per category
   ═══════════════════════════════════════════════════════ */
const categoryIcon: Record<string, string> = {
  Tiles: '◈',
  Sanitaryware: '◎',
  'Bath Fittings': '❖',
  'Marble & Granite': '◆',
  'Mosaic & Accents': '✦',
  'Interior Paints': '🎨',
  'Exterior Paints': '🏠',
  'Enamels': '✨',
  'Primers & Putty': '🧱',
  'All': '📦',
};

/* ═══════════════════════════════════════════════════════
   TiltCard — interactive 3D product card
   ═══════════════════════════════════════════════════════ */
interface TiltCardProps {
  product: Product;
  index: number;
  columns: number;
  onClick: (product: Product) => void;
  isPaintsMode: boolean;
  lowStockThreshold: number;
  showStockCount: boolean;
}

function StockDot({ product, showStockCount }: { product: Product, showStockCount?: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const inStock = product.stockCount !== undefined && product.stockCount > 0;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2500);
  };

  return (
    <div className="relative flex items-center">
      <button 
        onClick={handleClick}
        className={`w-3.5 h-3.5 rounded-full shadow-sm relative focus:outline-none transition-transform hover:scale-110 ${inStock ? 'bg-green-500' : 'bg-red-500'}`}
        aria-label={inStock ? "In Stock" : "Out of Stock"}
      >
        {inStock && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40 duration-1000" />}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 z-50 pointer-events-none"
          >
            {inStock 
              ? (showStockCount ? `In Stock (${product.stockCount})` : 'In Stock')
              : 'Out of Stock'
            }
            {/* little triangle pointer */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-white dark:border-t-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TiltCard({ product, index, columns, onClick, isPaintsMode, lowStockThreshold, showStockCount }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);

  /* ── mouse motion values ── */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const showPlaceholder = !product.image || imgError;

  return (
    <div className="product-card-3d h-full">
      {/* scroll‑reveal wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          duration: 0.8,
          delay: (index % columns) * 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* 3D tilt card - Fully wrapped */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => onClick(product)}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className={`group flex flex-col rounded-xl bg-white dark:bg-[#1a1a1a] shadow-md transition-shadow duration-300 border cursor-pointer ${isPaintsMode ? 'hover:shadow-[0_20px_50px_rgba(236,72,153,0.3)] border-pink-100 dark:border-pink-900/50' : 'hover:shadow-2xl border-gray-200 dark:border-white/10'}`}
        >
          {/* ── image area ── */}
          <div className="relative w-full aspect-[4/5] sm:min-h-[200px] overflow-hidden rounded-t-xl bg-gray-50 dark:bg-black/20">
            {showPlaceholder ? (
              <div className={`product-image-placeholder w-full h-full flex items-center justify-center ${isPaintsMode ? 'bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 dark:from-yellow-900/20 dark:via-pink-900/20 dark:to-purple-900/20' : 'bg-gray-100 dark:bg-white/5'}`}>
                <span className="select-none text-5xl opacity-30">
                  {categoryIcon[product.category] || '📦'}
                </span>
              </div>
            ) : (
              <>
                {isImgLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cream via-white to-cream bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  onLoad={() => setIsImgLoading(false)}
                  onError={() => {
                    setImgError(true);
                    setIsImgLoading(false);
                  }}
                  className={`block transition-all duration-700 ease-out group-hover:scale-[1.05] object-cover ${isImgLoading ? 'opacity-0' : 'opacity-100'} w-full h-full`}
                  loading="lazy"
                  decoding="async"
                />
              </>
            )}

            {/* gradient overlay inside image area */}
            <div className={`absolute inset-0 opacity-80 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 ${isPaintsMode ? 'bg-gradient-to-t from-black/70 via-black/10 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'}`} />
            
            {/* Expand Icon */}
            <div className={`absolute top-3 right-3 backdrop-blur-sm p-1.5 md:p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 ${isPaintsMode ? 'bg-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-black/40'}`}>
               <Maximize2 size={14} className="md:w-4 md:h-4" />
            </div>

            {/* Title overlay inside image area */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 transform-gpu z-10">
              <span className={`inline-block text-[0.6rem] md:text-[0.65rem] uppercase tracking-widest mb-1 drop-shadow-md ${isPaintsMode ? 'text-yellow-300 font-bold' : 'text-divine-gold/90'}`}>
                {product.category}
              </span>
              <h3 className="font-serif text-sm md:text-lg text-white leading-snug drop-shadow-md line-clamp-2">
                {product.name}
              </h3>
            </div>
          </div>

          {/* ── Meta Section (White/Dark BG) ── */}
          <div className="p-3 md:p-4 flex justify-between items-center bg-white dark:bg-[#1a1a1a] rounded-b-xl relative z-20 border-t border-gray-100 dark:border-white/5">
             <StockDot product={product} showStockCount={showStockCount} />
             
             <span className={`font-semibold text-xs md:text-sm tracking-widest whitespace-nowrap ${isPaintsMode ? 'text-pink-500' : 'text-divine-gold'}`}>
               ₹ {product.price?.toLocaleString('en-IN') || 0} {product.unit && <span className="text-[0.65rem] text-gray-500 dark:text-gray-400 font-normal">{product.unit}</span>}
             </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Products — main section
   ═══════════════════════════════════════════════════════ */
export function Products({ products, searchQuery }: ProductsProps) {
  const { isPaintMode, setPaintMode } = usePaintMode();
  const galleryMode = isPaintMode ? 'Paints' : 'Tiles';
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [columns, setColumns] = useState(5);
  const { settings } = useAdminData();

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w < 640) setColumns(2);
      else if (w < 1024) setColumns(3);
      else if (w < 1280) setColumns(4);
      else setColumns(5);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter strictly by collection
  const currentProducts = products.filter(p => galleryMode === 'Paints' ? p.collection === 'paints' : p.collection === 'tiles');
  
  // Use categories from settings if available
  const currentCategories = ['All', ...(galleryMode === 'Paints' ? settings.categories.paints : settings.categories.tiles)];

  // Reset category when switching modes
  useEffect(() => {
    setActiveCategory('All');
  }, [galleryMode]);

  /* ── filtering ── */
  const filtered = currentProducts.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleCount = isMobile ? 3 : 7;
  const showMoreButton = currentCategories.length > visibleCount;
  const visibleCategories = isFiltersExpanded ? currentCategories : currentCategories.slice(0, visibleCount);

  const containerRef = useRef<HTMLElement>(null);

  return (
    <section 
      id="gallery" 
      ref={containerRef}
      className={`relative py-24 md:py-32 scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-28 transition-colors duration-1000 overflow-hidden ${galleryMode === 'Paints' ? 'bg-transparent cursor-crosshair' : 'section-cream'}`}
    >
      
      {/* Removed PaintBackgroundLayer to rely on GlobalPaintOverlay */}

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* ═══════════ Mode Toggle ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="flex justify-center mb-16"
        >
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-1.5 rounded-full flex gap-2 border border-royal-purple/10 dark:border-white/10 shadow-xl relative overflow-hidden">
            {/* The animated sliding pill */}
            <motion.div
              initial={false}
              animate={{ 
                left: isPaintMode ? '50%' : '4px',
                width: 'calc(50% - 4px)',
                backgroundColor: isPaintMode ? '#ec4899' : '#1a0a3e',
                boxShadow: isPaintMode ? '0 4px 15px rgba(236, 72, 153, 0.5)' : '0 4px 15px rgba(26, 10, 62, 0.4)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-1.5 bottom-1.5 rounded-full pointer-events-none"
            />
            
            <button
              onClick={() => setPaintMode(false)}
              className={`relative px-6 md:px-10 py-3 md:py-4 rounded-full font-serif text-sm md:text-lg transition-colors duration-300 z-10 ${!isPaintMode ? 'text-white' : 'text-royal-purple/70 dark:text-white/70 hover:text-royal-purple dark:hover:text-white'}`}
            >
              Tiles & Sanitaryware
            </button>
            <button
              onClick={() => setPaintMode(true)}
              className={`relative px-6 md:px-10 py-3 md:py-4 rounded-full font-serif text-sm md:text-lg transition-colors duration-300 z-10 flex items-center gap-2 ${isPaintMode ? 'text-white' : 'text-pink-500/70 hover:text-pink-500'}`}
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold tracking-wide">
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isPaintMode ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse'}`} />
                Paints Collection
              </span>
            </button>
          </div>
        </motion.div>

        {/* ═══════════ Section Header ═══════════ */}
        <motion.div
          key={`header-${galleryMode}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <span className={`ornament-divider inline-flex justify-center font-sans text-xs tracking-[0.3em] uppercase ${galleryMode === 'Paints' ? 'text-pink-600' : 'text-divine-gold'}`}>
            {galleryMode === 'Paints' ? 'Colorful Expressions' : 'Our Portfolio'}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">
            {galleryMode === 'Paints' ? (
              <span className="dark:drop-shadow-[0_0_10px_rgba(219,39,119,0.5)]">
                <ShinyText text="Vibrant Palettes" speed={3} color="#db2777" shineColor="#fcd34d" />
              </span>
            ) : (
              <span className="dark:text-white">
                <ShinyText text="Exquisite Collections" speed={3} color="var(--shiny-base, #1a0a3e)" shineColor="#d4a843" className="[--shiny-base:#1a0a3e] dark:[--shiny-base:#d4d4d8]" />
              </span>
            )}
          </h2>
          <p className="font-sans text-gray-500 dark:text-white/60 font-light mt-4 max-w-xl mx-auto leading-relaxed max-md:bg-white/50 dark:max-md:bg-black/50 max-md:backdrop-blur-md max-md:p-4 max-md:rounded-xl">
            {galleryMode === 'Paints' 
              ? "Find the perfect shade from our extensive collection of long-lasting paints, primers, and putties for flawless interiors and exteriors."
              : "Explore our wide variety of floor and wall tiles, sturdy sanitaryware, and essential bath fittings designed for both durability and style."
            }
          </p>

          {searchQuery && (
            <p className="mt-4 font-sans text-sm text-gray-500 flex items-center justify-center gap-2">
              <Search size={14} />
              Showing results for{' '}
              <span className="font-medium text-royal-purple dark:text-gold-light">
                &ldquo;{searchQuery}&rdquo;
              </span>
            </p>
          )}
        </motion.div>

        {/* ═══════════ Filter Categories ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 md:mb-16 flex flex-col items-center gap-4 px-4"
        >
          <motion.div layout className="flex flex-wrap gap-2.5 pb-3 justify-center w-full">
            <AnimatePresence mode="popLayout">
              {visibleCategories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                      shrink-0 rounded-full px-5 py-2 text-xs font-sans font-medium
                      tracking-wider uppercase transition-all duration-300 border
                      ${isActive && galleryMode === 'Paints' ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/30' : ''}
                      ${isActive && galleryMode === 'Tiles' ? 'bg-royal-purple text-divine-gold border-royal-purple shadow-lg shadow-royal-purple/20' : ''}
                      ${!isActive ? 'bg-white/80 dark:bg-white/10 text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white' : ''}
                    `}
                  >
                    {cat}
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {showMoreButton && (
              <motion.button
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="shrink-0 rounded-full px-5 py-2 text-xs font-sans font-medium tracking-wider uppercase transition-all duration-300 border bg-transparent text-gray-500 dark:text-white/40 border-dashed border-gray-300 dark:border-white/20 hover:text-gray-800 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40"
              >
                {isFiltersExpanded ? 'Less -' : 'More +'}
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* ═══════════ Product Grid / Empty State ═══════════ */}
        {filtered.length > 0 ? (
            <motion.div 
              key={`grid-${galleryMode}-${activeCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-6 lg:gap-8"
            >
              {filtered.map((product, idx) => (
                <div key={product.id} className="mb-3 md:mb-6 lg:mb-8 break-inside-avoid">
                  <TiltCard 
                    product={product} 
                    index={idx} 
                    onClick={setSelectedProduct} 
                    isPaintsMode={galleryMode === 'Paints'} 
                    lowStockThreshold={settings.lowStockThreshold}
                    showStockCount={settings.showStockCount}
                  />
                </div>
              ))}
            </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${galleryMode === 'Paints' ? 'bg-pink-50' : 'bg-royal-purple/5'}`}>
              <PackageOpen size={36} className={galleryMode === 'Paints' ? 'text-pink-300' : 'text-royal-purple/30'} />
            </div>
            <h3 className={`font-serif text-2xl ${galleryMode === 'Paints' ? 'text-pink-600 dark:text-pink-400' : 'text-royal-purple dark:text-white'}`}>
              No products found
            </h3>
            <p className="font-sans text-sm text-gray-400 mt-2 max-w-xs">
              Try adjusting your search or selecting a different category.
            </p>
          </motion.div>
        )}
      </div>

      {/* Product Drawer (E-Catalog) */}
      <ProductDrawer
        isOpen={!!selectedProduct && !isVisualizerOpen}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        onVisualize={() => setIsVisualizerOpen(true)}
      />
      <RoomVisualizer
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
        productImage={selectedProduct?.image || null}
        productName={selectedProduct?.name || null}
      />
    </section>
  );
}
