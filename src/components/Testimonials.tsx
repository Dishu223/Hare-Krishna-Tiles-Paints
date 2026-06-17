import { useRef, useState, useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, wrap } from 'motion/react';
import { Star } from 'lucide-react';
import ShinyText from './ShinyText';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';

interface Review {
  id: number;
  name: string;
  avatar: string;
  text: string;
  rating: number;
}

const reviewsRow1: Review[] = [
  { id: 1, name: "Ramesh Sharma", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", text: "Bahut badhiya quality ki tiles hain. Service bhi excellent hai! (Very good quality tiles. Excellent service!)", rating: 5 },
  { id: 2, name: "Anita Desai", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", text: "Absolutely stunning collection. Transformed my bathroom completely.", rating: 5 },
  { id: 3, name: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", text: "Dehradun mein sabse best showroom. Pricing and behavior is top class.", rating: 5 },
  { id: 4, name: "Pooja Verma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", text: "Inka collection aur staff ka nature bahut achha hai. Recommended!", rating: 4 },
];

const reviewsRow2: Review[] = [
  { id: 5, name: "Rahul Gupta", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", text: "Premium sanitaryware at reasonable prices. Very satisfied with the purchase.", rating: 5 },
  { id: 6, name: "Meena Kumari", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", text: "Ghar ke liye yahi se tiles li thi. Sabko bahut pasand aayi.", rating: 5 },
  { id: 7, name: "Suresh Patel", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=150&q=80", text: "Great variety of modern and traditional designs.", rating: 4 },
  { id: 8, name: "Kavita Joshi", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", text: "Ekdum 5-star service! Delivery bhi time par mili.", rating: 5 },
];

const reviewsRow3: Review[] = [
  { id: 9, name: "Amit Kumar", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80", text: "Best place in town for luxury tiles. Definitely visiting again for the kitchen.", rating: 5 },
  { id: 10, name: "Sneha Reddy", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", text: "Designs bahut hi unique hain. Customer service is also very helpful.", rating: 5 },
  { id: 11, name: "Manish Tiwari", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80", text: "Pricing is very fair for the premium quality they offer.", rating: 4 },
  { id: 12, name: "Deepa Nair", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80", text: "Showroom bahut sundar hai, aur collection bhi wide range ka hai.", rating: 5 },
];

function InfiniteStrip({ items, direction = 'left', speed = 40 }: { items: Review[], direction?: 'left' | 'right', speed?: number }) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseX = useMotionValue(0);
  
  // Item width: on mobile w-56 (224px) + gap-4 (16px) = 240px. On PC w-80 (320px) + gap-6 (24px) = 344px
  const itemWidth = isMobile ? 240 : 344;
  const contentWidth = items.length * itemWidth;
  
  const duplicatedItems = [...items, ...items, ...items];

  useAnimationFrame((_, delta) => {
    let moveBy = direction === 'left' ? -speed * (delta / 1000) : speed * (delta / 1000);
    // Faster on mobile since items are smaller
    if (isMobile) moveBy *= 1.2;
    baseX.set(baseX.get() + moveBy);
  });

  // Use framer's wrap to snap it infinitely within 1 content length
  const x = useTransform(baseX, (v) => `${wrap(-contentWidth, 0, v)}px`);

  return (
    <div className="overflow-hidden w-full py-2 md:py-4 -mx-4 px-4 cursor-grab active:cursor-grabbing">
      <motion.div
        className="flex gap-4 md:gap-6 w-max"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -contentWidth, right: 0 }}
        dragElastic={0}
        onDrag={(e, info) => {
          // Manual drag updates the base X
          baseX.set(baseX.get() + info.delta.x);
        }}
      >
        {duplicatedItems.map((review, i) => (
          <div 
            key={`${review.id}-${i}`} 
            className="w-56 md:w-80 shrink-0 bg-white dark:bg-white/5 border border-royal-purple/10 dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow pointer-events-none"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <img src={review.avatar} alt={review.name} loading="lazy" decoding="async" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-divine-gold/30" />
              <div>
                <h4 className="font-serif text-sm md:text-base text-royal-purple dark:text-white font-medium line-clamp-1">{review.name}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-divine-gold fill-divine-gold' : 'text-gray-300 dark:text-white/20'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="font-sans text-xs md:text-sm text-gray-600 dark:text-white/60 leading-relaxed">"{review.text}"</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
import { usePaintMode } from './PaintModeContext';

export function Testimonials() {
  const { isPaintMode } = usePaintMode();
  const containerRef = useRef<HTMLElement>(null);
  return (
    <section id="testimonials" ref={containerRef} className={`py-24 md:py-32 scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-28 relative overflow-hidden transition-colors duration-1000 ${isPaintMode ? 'bg-transparent' : 'section-cream'}`}>
      
      <div id="testimonials-start" className="absolute top-0 left-0 w-full h-1" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center mb-16">
        <div className="flex justify-center w-full">
          <span className="ornament-divider inline-flex text-divine-gold font-sans text-xs tracking-[0.3em] uppercase">
            Testimonials
          </span>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl mt-4 relative inline-block text-royal-purple dark:text-white">
          Trusted by <ShinyText text="Our Community" speed={3} color="var(--shiny-base, #1a0a3e)" shineColor="#d4a843" className="[--shiny-base:#1a0a3e] dark:[--shiny-base:#d4d4d8]" />
        </h2>
        <p className="font-sans text-gray-600 dark:text-white/60 font-light mt-4 max-w-xl mx-auto leading-relaxed max-md:bg-white/50 dark:max-md:bg-black/50 max-md:backdrop-blur-md max-md:p-4 max-md:rounded-xl">
          Hear from our neighbors and customers who have trusted us with their home building and renovation needs.
        </p>
      </div>

      <div className="flex flex-col gap-6 relative z-50 w-[110%] -left-[5%] md:w-[120%] md:-left-[10%] max-w-none">
        <InfiniteStrip items={reviewsRow1} direction="right" speed={30} />
        <InfiniteStrip items={reviewsRow2} direction="left" speed={35} />
        <InfiniteStrip items={reviewsRow3} direction="right" speed={25} />
      </div>

      {/* Decorative gradients for the edges to blend the strips */}
      <div 
        className="absolute top-0 left-0 w-32 md:w-48 h-full bg-gradient-to-r from-warm-white dark:from-deep-black to-transparent z-50 pointer-events-none" 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      />
      <div 
        className="absolute top-0 right-0 w-32 md:w-48 h-full bg-gradient-to-l from-warm-white dark:from-deep-black to-transparent z-50 pointer-events-none" 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      />
    </section>
  );
}
