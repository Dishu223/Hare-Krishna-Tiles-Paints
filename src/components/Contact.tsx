import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { MapPin, Phone, Mail, Instagram, Facebook, X as CloseIcon } from 'lucide-react';
import { businessInfo } from '../data';
import ShinyText from './ShinyText';
import { Dock } from './Dock';
import { WhatsAppIcon } from './FloatingWhatsApp';
import { usePaintMode } from './PaintModeContext';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';

function TiltLightbox({ src, alt, onClose }: { src: string, alt: string, onClose: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX - window.innerWidth / 2);
      y.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  // Very slight 3D rotation based on mouse position
  const rotateX = useTransform(y, [-window.innerHeight / 2, window.innerHeight / 2], [5, -5]);
  const rotateY = useTransform(x, [-window.innerWidth / 2, window.innerWidth / 2], [-5, 5]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 cursor-zoom-out perspective-1000"
      data-lenis-prevent="true"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-full h-full max-w-5xl flex items-center justify-center"
      >
        <motion.img
          layoutId={`contact-img-${src}`}
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-full object-contain rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] cursor-default"
        />
        {/* Soft glare effect */}
        <motion.div 
          className="absolute inset-0 rounded-xl pointer-events-none mix-blend-overlay opacity-30"
          style={{
            background: useTransform(() => {
              return `radial-gradient(circle at ${x.get() + window.innerWidth / 2}px ${y.get() + window.innerHeight / 2}px, rgba(255,255,255,0.4) 0%, transparent 60%)`;
            })
          }}
        />
      </motion.div>

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer z-[200] shadow-xl"
      >
        <CloseIcon className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </motion.div>,
    document.body
  );
}

function TiltPhoto({ src, alt, onClick }: { src: string, alt: string, onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent) => {
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

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-divine-gold/30 group shadow-2xl cursor-zoom-in"
    >
      <motion.img
        layoutId={`contact-img-${src}`}
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
    </motion.div>
  );
}

export function Contact({ isDockVisible }: { isDockVisible?: boolean }) {
  const { isPaintMode } = usePaintMode();
  const [imageError, setImageError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string} | null>(null);

  // Use a generic google maps embed URL based on the address
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(businessInfo.name + ', ' + businessInfo.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section id="contact" ref={containerRef} className={`py-24 md:py-32 scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-28 text-royal-purple relative overflow-hidden transition-colors duration-1000 ${isPaintMode ? 'bg-transparent' : 'section-cream'}`}>
      
      {/* Subtle background ornament */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-peacock-blue/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-divine-gold/[0.04] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="flex justify-center w-full">
            <span className="ornament-divider inline-flex text-divine-gold font-sans text-xs tracking-[0.3em] uppercase">
              Get In Touch
            </span>
          </div>
          <h2 id="journey-end" className="font-serif text-4xl md:text-5xl mt-4 relative inline-block">
            <ShinyText 
              text="Jai Shree Krishna" 
              speed={3} 
              color="var(--shiny-base, #1a0a3e)" 
              shineColor="#d4a843" 
              className="[--shiny-base:#1a0a3e] dark:[--shiny-base:#d4d4d8]"
            />
          </h2>
          <p className="font-sans text-gray-600 dark:text-white/60 font-light mt-4 max-w-xl mx-auto leading-relaxed max-md:bg-white/50 dark:max-md:bg-black/50 max-md:backdrop-blur-md max-md:p-4 max-md:rounded-xl">
            Step into a world of exquisite tiles and sanitaryware. Find us at our premium showroom in Dehradun.
          </p>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 mt-16">
          {/* ── Left Column: Radha Krishna Image ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-3 h-[400px] lg:h-auto"
          >
            <div className="w-full h-full bg-white border border-royal-purple/10 rounded-2xl overflow-hidden backdrop-blur-sm relative group shadow-2xl">
              <motion.img
                layoutId={`contact-img-/products/radha-krishna.png`}
                src="/products/radha-krishna.png"
                alt="Radha Krishna"
                onClick={() => setSelectedImage({ src: '/products/radha-krishna.png', alt: 'Radha Krishna' })}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                fetchpriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* ── Right Column: Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
            className="lg:col-span-2 flex flex-col justify-center"
          >
            {/* Contact Details Card */}
            <div className="bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border border-royal-purple/10 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl space-y-8 flex flex-col items-start w-full transition-colors duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-divine-gold/5 blur-[50px] rounded-full pointer-events-none" />

              {/* Address */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-royal-purple/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-royal-purple/10 dark:border-white/10">
                  <MapPin className="w-6 h-6 text-divine-gold" />
                </div>
                <div className="pt-1.5">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Location</h4>
                  <p className="text-gray-700 dark:text-white/90 text-sm font-sans leading-relaxed transition-colors">
                    {businessInfo.address}
                  </p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start gap-4 relative z-10 w-full">
                <div className="w-12 h-12 rounded-2xl bg-royal-purple/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-royal-purple/10 dark:border-white/10">
                  <Phone className="w-6 h-6 text-divine-gold" />
                </div>
                <div className="pt-1.5 flex flex-col gap-3 w-full">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Direct Lines</h4>
                  {businessInfo.owners.map((owner, idx) => {
                    const isMukesh = owner.name.includes("Mukesh");
                    const isMayank = owner.name.includes("Mayank");
                    
                    const isHighlighted = (isMukesh && !isPaintMode) || (isMayank && isPaintMode);
                    
                    return (
                      <div key={idx} className={`flex flex-col p-4 rounded-2xl transition-all duration-500 w-full ${isHighlighted ? (isPaintMode ? 'bg-pink-50 dark:bg-pink-900/10 shadow-sm border border-pink-100 dark:border-pink-900/30' : 'bg-royal-purple/5 dark:bg-gold-light/5 shadow-sm border border-royal-purple/10 dark:border-gold-light/10') : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'}`}>
                        <span className={`text-xs uppercase tracking-wider mb-1 font-bold flex items-center gap-2 ${isHighlighted ? (isPaintMode ? 'text-pink-600 dark:text-pink-400' : 'text-royal-purple dark:text-gold-light') : 'text-gray-500 dark:text-gray-400'}`}>
                          {owner.name}
                          {isHighlighted && <span className={`inline-block px-2 py-0.5 rounded-full text-[0.6rem] shadow-sm font-semibold ${isPaintMode ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' : 'bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/10'}`}>Owner</span>}
                        </span>
                        <a
                          href={`tel:${owner.number.replace(/\s/g, '')}`}
                          className={`text-base font-sans transition-colors font-medium tracking-wide ${isHighlighted ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-white/80 hover:text-royal-purple dark:hover:text-gold-light'}`}
                        >
                          {owner.number}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-royal-purple/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-royal-purple/10 dark:border-white/10">
                  <Mail className="w-6 h-6 text-divine-gold" />
                </div>
                <div className="pt-1.5">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Email Support</h4>
                  <a
                    href={`mailto:${businessInfo.email}`}
                    className="text-gray-700 dark:text-white/90 text-sm font-sans hover:text-royal-purple dark:hover:text-gold-light transition-colors font-medium"
                  >
                    {businessInfo.email}
                  </a>
                </div>
              </div>

              <div className="pt-4 w-full relative z-10 border-t border-gray-100 dark:border-white/10">
                {/* Google Maps Link */}
                <a
                  href={businessInfo.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-royal-purple dark:bg-white/5 border border-transparent dark:border-white/10 text-white dark:text-white/90 rounded-2xl hover:bg-royal-purple/90 dark:hover:bg-white/10 font-sans text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-xl group"
                >
                  <MapPin className="w-5 h-5 text-divine-gold" />
                  <span>Get Directions</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1 text-divine-gold">→</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Dock at the very bottom, right on the edge of the section */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <Dock 
          items={[
            { 
              icon: <Instagram className="w-5 h-5 md:w-6 md:h-6 text-white" />, 
              label: 'Instagram', 
              onClick: () => window.open(businessInfo.socialLinks?.instagram || '#', '_blank') 
            },
            { 
              icon: <Facebook className="w-5 h-5 md:w-6 md:h-6 text-white" />, 
              label: 'Facebook', 
              onClick: () => window.open(businessInfo.socialLinks?.facebook || '#', '_blank') 
            },
            { 
              id: 'whatsapp-dock-slot',
              icon: isDockVisible ? (
                <motion.div
                  layoutId="whatsapp-button"
                  className="w-full h-full text-white flex items-center justify-center p-[6px] transition-colors"
                  style={{ borderRadius: '9999px' }}
                >
                  <WhatsAppIcon />
                </motion.div>
              ) : (
                <div className="w-full h-full rounded-full opacity-0" />
              ),
              label: 'WhatsApp', 
              onClick: () => {
                if (!isDockVisible) return;
                window.open(`https://wa.me/${businessInfo.whatsapp}`, '_blank');
              }
            }
          ]}
          panelHeight={64}
          baseItemSize={48}
          magnification={65}
          distance={150}
        />
      </div>

      <AnimatePresence>
        {selectedImage && (
          <TiltLightbox 
            src={selectedImage.src} 
            alt={selectedImage.alt} 
            onClose={() => setSelectedImage(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
