import { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CraftingSpaces } from './components/CraftingSpaces';
import { Products } from './components/Products';
import { Testimonials } from './components/Testimonials';
import { AboutUs } from './components/AboutUs';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { GlobalPaintOverlay } from './components/GlobalPaintOverlay';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CustomCursor } from './components/CustomCursor';
import { GlobalJourney } from './components/GlobalJourney';
import { useAdminData } from './components/admin/AdminDataContext';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { Megaphone } from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [isDockVisible, setIsDockVisible] = useState(false);
  const { products, announcements } = useAdminData();
  const activeAnnouncements = announcements.filter(a => a.isActive);

  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    const handleScroll = () => {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        // The Dock is at the bottom of the contact section.
        // It becomes visible when rect.bottom < window.innerHeight + 150
        setIsDockVisible(rect.bottom <= window.innerHeight + 150);
      }
    };

    updateFooterHeight();
    handleScroll();
    window.addEventListener('resize', updateFooterHeight);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', updateFooterHeight);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Only pass published non-paint products to the original products prop, 
  // or we can pass all and let Products.tsx handle it. Since Products handles categories, pass all published.
  const publishedProducts = products.filter(p => !p.draft);

  return (
    <>
      <CustomCursor />
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-deep-black min-h-screen"
        >
          <LayoutGroup>
            {/* Main Content Wrapper */}
            <div 
            className="relative z-10 bg-warm-white shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            style={{ marginBottom: footerHeight }}
          >
            <GlobalJourney />

            <Navbar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onNavigate={handleNavigate} 
            />
            
            <main>
              <Hero onExplore={() => handleNavigate('crafting-spaces')} />

              {/* Wrapper for the rest of the page to contain the GlobalPaintOverlay seamlessly */}
              <div className="relative z-10 bg-cream dark:bg-deep-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] -mt-32 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
                <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-clip rounded-t-[2.5rem] md:rounded-t-[3.5rem]">
                  <GlobalPaintOverlay />
                </div>
                
                <CraftingSpaces onExplore={() => handleNavigate('collections')} />
                <Products products={publishedProducts} searchQuery={searchQuery} />
                <Testimonials />
                <AboutUs />
                <Contact isDockVisible={isDockVisible} />
              </div>
            </main>
          </div>
          
          {/* Footer Reveal Layer */}
          <div ref={footerRef} className="fixed bottom-0 left-0 w-full z-0">
            <Footer />
          </div>

          <FloatingWhatsApp isDocked={isDockVisible} />
          </LayoutGroup>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
