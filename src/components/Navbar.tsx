import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, Sun, Moon, Volume2, VolumeX, Megaphone } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useSound } from './SoundProvider';
import { usePaintMode } from './PaintModeContext';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';
import { useAdminData } from './admin/AdminDataContext';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigate: (id: string) => void;
}

const navLinks = [
  { label: 'Home', id: 'home' },
  { label: 'Gallery', id: 'collections' },
  { label: 'Reviews', id: 'testimonials' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

export function Navbar({ searchQuery, setSearchQuery, onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isMuted, toggleMute, masterVolume, setMasterVolume } = useSound();
  const { isPaintMode, setPaintMode } = usePaintMode();
  const headerRef = React.useRef<HTMLElement>(null);
  const { announcements } = useAdminData();
  const activeAnnouncements = announcements.filter(a => a.isActive);
  const hasAnnouncements = activeAnnouncements.length > 0;

  const handleScroll = useCallback(() => {
    // The Hero animation is 500vh tall on desktop, 300vh on mobile.
    const isMobile = window.innerWidth < 768;
    const threshold = isMobile ? 1.5 : 3.5;
    setIsScrolled(window.scrollY > window.innerHeight * threshold);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      onNavigate(id);
    }, 150);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavClick('collections');
    }
  };

  return (
    <>
      <AnimatePresence>
        {hasAnnouncements && isScrolled && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-[110] bg-yellow-400 text-red-600 text-[11px] md:text-sm font-sans font-extrabold py-1.5 overflow-hidden shadow-md border-b border-red-500/20"
          >
            <div className="flex items-center w-max animate-[scroll_20s_linear_infinite] hover:animate-none">
              {/* Duplicate announcements 4 times to ensure seamless infinite scroll on wide screens */}
              {[...activeAnnouncements, ...activeAnnouncements, ...activeAnnouncements, ...activeAnnouncements].map((ann, i) => (
                <div key={`${ann.id}-${i}`} className="flex items-center gap-2 px-8">
                  <Megaphone size={14} className="animate-pulse shrink-0" />
                  <span className="tracking-wide uppercase whitespace-nowrap">{ann.content}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        ref={headerRef}
        initial={{ y: -20, opacity: 0 }}
        animate={
          isScrolled 
            ? { y: 0, opacity: 1 } 
            : { y: -20, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 z-[100] transition-colors duration-700 ease-out ${hasAnnouncements ? 'top-7 md:top-8' : 'top-0'} ${
          isScrolled
            ? 'backdrop-blur-2xl bg-white/60 dark:bg-black/40 border-b border-divine-gold/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] pointer-events-auto'
            : 'bg-transparent border-b border-transparent pointer-events-none'
        }`}
      >
        <div className="w-full px-4 lg:px-8 xl:px-12 relative">
          <div className="flex items-center justify-between h-16 md:h-20 lg:h-20">

            {/* 🎨 Logo */}
            <div className="flex shrink-0 justify-center lg:justify-start z-10 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 w-full lg:w-auto">
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <img 
                  src="/harekrishna-logo.png" 
                  alt="Hare KRishna Tiles & Paints" 
                  decoding="async"
                  className="h-[85px] sm:h-[95px] md:h-[70px] lg:h-[80px] w-auto max-w-[75vw] md:max-w-[45vw] lg:max-w-[500px] object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            </div>

            {/* 🎨 Desktop Navigation (CENTERED) */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6 z-10">
              {navLinks.map((link) => (
                <React.Fragment key={link.id}>
                  <button
                    onClick={() => {
                      handleNavClick(link.id);
                    }}
                    className={`relative font-sans text-xs tracking-[0.2em] uppercase transition-colors duration-300 cursor-pointer group py-1 ${
                      isScrolled ? 'text-royal-purple/80 hover:text-divine-gold dark:text-divine-gold/90 dark:hover:text-gold-light' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {/* Hover underline */}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-divine-gold/60 transition-all duration-300 group-hover:w-full" />
                  </button>
                  {link.id === 'collections' && (
                    <button
                      onClick={() => {
                        setPaintMode(!isPaintMode);
                      }}
                      className={`relative font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer group py-1.5 px-4 rounded-full font-bold border ${
                        isPaintMode 
                          ? 'bg-pink-500/10 text-pink-600 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                          : 'bg-divine-gold/10 text-divine-gold border-divine-gold/30 shadow-[0_0_15px_rgba(212,168,67,0.2)] hover:bg-divine-gold/20 hover:border-divine-gold/50'
                      }`}
                    >
                      PAINTS
                    </button>
                  )}
                </React.Fragment>
              ))}

              {/* Search bar with spacing from Contact */}
              <div className="relative ml-4 xl:ml-8">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300 ${isScrolled ? 'text-royal-purple/40 dark:text-white/40' : 'text-white/50'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search tiles..."
                  className={`w-44 xl:w-56 pl-10 pr-4 py-2.5 rounded-full text-xs font-sans tracking-wide outline-none transition-all duration-300 focus:w-56 xl:focus:w-72 ${
                    isScrolled 
                      ? 'bg-royal-purple/5 dark:bg-white/5 text-royal-purple dark:text-white placeholder-royal-purple/40 dark:placeholder-white/40 border border-royal-purple/10 dark:border-white/10 focus:border-divine-gold/50 dark:focus:border-divine-gold/50 focus:bg-royal-purple/10 dark:focus:bg-white/10' 
                      : 'bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:bg-white/20'
                  }`}
                />
              </div>
            </nav>

            {/* 🎨 Desktop Controls (RIGHT) */}
            <div className="hidden lg:flex shrink-0 items-center justify-end z-10 gap-3 xl:gap-4">
              {/* Desktop Toggles */}
              <div className={`flex items-center gap-3 xl:gap-4 transition-colors duration-300`}>
                <div className="relative flex items-center group">
                  <button
                    onClick={toggleMute}
                    className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                      isScrolled ? 'bg-royal-purple/5 hover:bg-royal-purple/10 dark:bg-white/5 dark:hover:bg-white/10 text-royal-purple dark:text-divine-gold hover:text-divine-gold' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    aria-label="Toggle sound"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 xl:w-6 xl:h-6" /> : <Volume2 className="w-5 h-5 xl:w-6 xl:h-6" />}
                  </button>
                  
                  {/* Volume Slider Dropdown */}
                  <div className="absolute top-[120%] left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-3 rounded-xl border glass border-divine-gold/20 shadow-xl z-50">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-divine-gold/70 uppercase tracking-widest font-sans">Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                        className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-divine-gold [&::-webkit-slider-thumb]:rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <ThemeToggleButton3
                  isDark={theme === 'dark'}
                  onClick={toggleTheme}
                  className="w-9 h-9 xl:w-10 xl:h-10"
                  idSuffix="desktop"
                />
                
                {/* Loudspeaker Button (Desktop) */}
                <div className="relative">
                  <button
                    onClick={() => setIsAnnouncementsOpen(!isAnnouncementsOpen)}
                    className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                      isScrolled ? 'bg-royal-purple/5 hover:bg-royal-purple/10 dark:bg-white/5 dark:hover:bg-white/10 text-royal-purple dark:text-divine-gold hover:text-divine-gold' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    aria-label="View announcements"
                  >
                    <Megaphone className="w-5 h-5 xl:w-6 xl:h-6" />
                    {hasAnnouncements && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#121212] rounded-full"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isAnnouncementsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-[120%] right-0 w-80 p-4 rounded-2xl glass-light dark:bg-[#1e1e1e]/90 shadow-2xl border border-royal-purple/10 dark:border-white/10 z-50 overflow-hidden"
                      >
                      <h3 className="font-serif text-lg text-royal-purple dark:text-gold-light mb-3 border-b border-royal-purple/10 dark:border-white/10 pb-2">Latest Updates</h3>
                      <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                        {activeAnnouncements.length > 0 ? activeAnnouncements.map(ann => (
                          <div key={ann.id} className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                            <h4 className="font-sans font-bold text-sm text-royal-purple dark:text-white">{ann.title}</h4>
                            <p className="font-sans text-xs text-gray-600 dark:text-gray-300 mt-1">{ann.content}</p>
                            <span className="text-[9px] text-gray-400 mt-2 block">{new Date(ann.createdAt).toLocaleDateString()}</span>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-500 italic">No new announcements.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Mobile Left Controls (Speaker & Announcements) ──────── */}
          <div className="flex items-center lg:hidden absolute left-5 z-20 gap-2">
            <div className="relative flex items-center group">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                  isScrolled ? 'text-royal-purple/80 hover:text-divine-gold dark:text-divine-gold' : 'text-white/80 hover:text-white'
                }`}
                aria-label="Toggle sound"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              {/* Volume Slider Dropdown (Mobile) */}
              <div className="absolute top-[120%] left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-3 rounded-xl border glass border-divine-gold/20 shadow-xl z-50">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] text-divine-gold/70 uppercase tracking-widest font-sans">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-divine-gold [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Loudspeaker Button (Mobile) */}
            <div className="relative">
              <button
                onClick={() => setIsAnnouncementsOpen(!isAnnouncementsOpen)}
                className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                  isScrolled ? 'text-royal-purple/80 hover:text-divine-gold dark:text-divine-gold' : 'text-white/80 hover:text-white'
                }`}
                aria-label="View announcements"
              >
                <Megaphone className="w-6 h-6" />
                {hasAnnouncements && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-deep-black rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {isAnnouncementsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-[120%] left-0 w-[85vw] max-w-sm p-4 rounded-2xl glass-light dark:bg-[#1e1e1e]/95 shadow-2xl border border-royal-purple/10 dark:border-white/10 z-50 overflow-hidden"
                  >
                    <h3 className="font-serif text-lg text-royal-purple dark:text-gold-light mb-3 border-b border-royal-purple/10 dark:border-white/10 pb-2">Latest Updates</h3>
                    <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {activeAnnouncements.length > 0 ? activeAnnouncements.map(ann => (
                        <div key={ann.id} className="bg-white/50 dark:bg-black/30 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                          <h4 className="font-sans font-bold text-sm text-royal-purple dark:text-white">{ann.title}</h4>
                          <p className="font-sans text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{ann.content}</p>
                          <span className="text-[9px] text-gray-400 mt-2 block">{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 italic">No new announcements.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 🎨 Mobile Controls (Right) 🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨🎨 */}
          <div className="flex items-center gap-3 lg:hidden absolute right-5 z-20">
            <ThemeToggleButton3
              isDark={theme === 'dark'}
              onClick={toggleTheme}
              className="w-9 h-9"
              idSuffix="mobile"
            />
            
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                isScrolled ? 'text-royal-purple/80 hover:text-divine-gold hover:bg-royal-purple/5 dark:text-divine-gold dark:hover:bg-white/5' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu Panel ───────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden"
          >
            <div className="glass-light border-t border-divine-gold/10">
              <div className="max-w-7xl mx-auto px-5 py-6 space-y-1">
                {/* Mobile Search */}
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-royal-purple/40 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search our collection..."
                    className="w-full pl-11 pr-5 py-3 rounded-full bg-royal-purple/5 focus:bg-royal-purple/10 text-royal-purple text-sm font-sans tracking-wide placeholder-royal-purple/35 border border-royal-purple/10 focus:border-divine-gold/50 outline-none transition-all duration-300"
                  />
                </div>

                {/* Mobile Nav Links */}
                {navLinks.map((link, i) => (
                  <React.Fragment key={link.id}>
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                      onClick={() => {
                        handleNavClick(link.id);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-royal-purple/80 hover:text-divine-gold hover:bg-royal-purple/5 dark:text-divine-gold/90 dark:hover:text-gold-light dark:hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                    >
                      {/* Decorative gold dot */}
                      <span className="w-1.5 h-1.5 rounded-full bg-divine-gold/40 group-hover:bg-divine-gold group-hover:shadow-[0_0_8px_rgba(212,168,67,0.5)] transition-all duration-300" />
                      <span className="font-sans text-sm tracking-[0.2em] uppercase">
                        {link.label}
                      </span>
                    </motion.button>
                    {link.id === 'collections' && (
                      <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + (i + 0.5) * 0.08, duration: 0.35 }}
                        onClick={() => {
                          setPaintMode(!isPaintMode);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 cursor-pointer group border ${
                          isPaintMode 
                            ? 'bg-pink-500/10 text-pink-600 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                            : 'bg-divine-gold/5 text-divine-gold border-divine-gold/20 shadow-[0_0_15px_rgba(212,168,67,0.1)] hover:bg-divine-gold/10 hover:border-divine-gold/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isPaintMode ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-divine-gold shadow-[0_0_8px_rgba(212,168,67,0.5)]'}`} />
                        <span className={`font-sans text-sm tracking-[0.2em] uppercase font-bold`}>
                          PAINTS
                        </span>
                      </motion.button>
                    )}
                  </React.Fragment>
                ))}

                {/* Mobile divider */}
                <div className="pt-4 mt-2 border-t border-royal-purple/5">
                  <p className="px-4 font-serif text-xs text-divine-gold/40 italic tracking-wide">
                    Best Designs @ Best Price
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
}

// ── ThemeToggleButton3 ───────────────────────────────
export function ThemeToggleButton3({
  className = "",
  isDark,
  onClick,
  idSuffix = "desktop"
}: {
  className?: string;
  isDark: boolean;
  onClick: () => void;
  idSuffix?: string;
}) {
  return (
    <button
      type="button"
      className={`rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center cursor-pointer p-2 ${
        isDark 
          ? "bg-black text-white hover:bg-neutral-900 border border-neutral-800" 
          : "bg-white text-black hover:bg-neutral-100 border border-neutral-200"
      } ${className}`}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-full h-full"
      >
        <clipPath id={`skiper-btn-3-${idSuffix}`}>
          <motion.path
            animate={{ y: isDark ? 14 : 0, x: isDark ? -11 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-11h25a1 1 0 0017 13v30H0Z"
          />
        </clipPath>
        <g clipPath={`url(#skiper-btn-3-${idSuffix})`}>
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}

