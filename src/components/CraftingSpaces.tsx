import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { usePaintMode } from './PaintModeContext';
import ShinyText from './ShinyText';
import { MagneticButton } from './MagneticButton';

interface CraftingSpacesProps {
  onExplore: () => void;
}

export const CraftingSpaces = forwardRef<HTMLElement, CraftingSpacesProps>(
  ({ onExplore }, ref) => {
    const { isPaintMode } = usePaintMode();

    return (
      <section ref={ref} id="crafting-spaces" className={`relative py-20 md:py-32 transition-colors duration-500 flex flex-col items-center text-center px-6 md:px-6 z-10 overflow-hidden ${
        isPaintMode ? 'bg-transparent' : 'bg-cream dark:bg-deep-black'
      }`}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Subtitle */}
          <p className={`relative z-10 font-sans text-[0.65rem] md:text-xs tracking-widest uppercase font-medium mb-5 md:mb-6 flex items-center justify-center gap-4 transition-colors duration-1000 ${isPaintMode ? 'text-pink-500' : 'text-divine-gold'}`}>
            <span className={`w-8 h-px transition-colors duration-1000 ${isPaintMode ? 'bg-pink-500/50' : 'bg-divine-gold/50'}`}></span>
            <span>
              <span className={`font-bold text-[0.7rem] md:text-[0.8rem] text-cyan-600 dark:text-yellow-400 drop-shadow-[0_0_8px_currentColor]`}>H</span>
              <span className={`transition-colors duration-1000 ${isPaintMode ? 'text-pink-500' : 'text-divine-gold'}`}>ARE </span>
              <span className={`font-bold text-[0.7rem] md:text-[0.8rem] text-cyan-600 dark:text-yellow-400 drop-shadow-[0_0_8px_currentColor]`}>KR</span>
              <span className={`transition-colors duration-1000 ${isPaintMode ? 'text-pink-500' : 'text-divine-gold'}`}>ISHNA TILES & PAINTS</span>
            </span>
            <span className={`w-8 h-px transition-colors duration-1000 ${isPaintMode ? 'bg-pink-500/50' : 'bg-divine-gold/50'}`}></span>
          </p>

          {/* Main Heading */}
          <h1 id="journey-start" className="relative z-10 font-serif text-4xl md:text-6xl lg:text-7xl text-royal-purple dark:text-gold-light leading-[1.1] mb-6 md:mb-8 transition-colors duration-300">
            Crafting Spaces of<br/>
            <ShinyText 
              text="Timeless Elegance" 
              speed={3} 
              color="#d4a843" 
              shineColor="#ffffff" 
              className="italic font-serif"
            />
          </h1>

          {/* Description */}
          <p className="relative z-10 font-sans text-base md:text-lg text-royal-purple/75 dark:text-white/80 font-light leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12 transition-colors duration-300 max-md:bg-white/50 dark:max-md:bg-black/50 max-md:backdrop-blur-md max-md:p-4 max-md:rounded-xl">
            Your trusted destination in Dehradun for top-grade tiles, vibrant paints, sanitaryware, and everyday hardware. We provide durable, beautiful materials at fair prices to help you build the space you've always wanted.
          </p>

          {/* CTA */}
          <MagneticButton
            onClick={onExplore}
            className="relative z-10 mx-auto btn-gold-shimmer px-8 md:px-10 py-4 rounded-full text-xs md:text-sm flex items-center gap-3 group cursor-pointer shadow-xl shadow-divine-gold/20"
          >
            Explore Our Range
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>
        </motion.div>
      </section>
    );
  }
);

CraftingSpaces.displayName = 'CraftingSpaces';
