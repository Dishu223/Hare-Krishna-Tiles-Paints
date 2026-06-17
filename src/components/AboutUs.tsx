import { useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Diamond, HeartHandshake } from 'lucide-react';
import ShinyText from './ShinyText';
import { PaintBackgroundLayer } from './PaintBackgroundLayer';

const pillars = [
  {
    icon: Shield,
    title: 'Honest Pricing',
    description: 'Serving our community with transparent and fair pricing on all our paints, hardware, and tiles. No hidden costs.'
  },
  {
    icon: Diamond,
    title: 'Reliable Quality',
    description: 'We stock trusted brands like Birla Opus Paints and durable materials that stand the test of time, ensuring your home is built to last.'
  },
  {
    icon: HeartHandshake,
    title: 'Personalized Help',
    description: 'From picking the exact shade of paint to matching your floor tiles, our friendly team is always ready to guide you.'
  }
];
import { usePaintMode } from './PaintModeContext';

export function AboutUs() {
  const { isPaintMode } = usePaintMode();
  const containerRef = useRef<HTMLElement>(null);
  return (
    <section id="about" ref={containerRef} className={`py-24 md:py-32 scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-28 relative overflow-hidden transition-colors duration-1000 ${isPaintMode ? 'bg-transparent' : 'section-cream'}`}>
      
      <div id="about-us-start" className="absolute top-0 left-0 w-full h-1" />
      
      {/* Decorative Ornaments */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-divine-gold/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[300px] h-[300px] rounded-full bg-peacock-blue/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center w-full">
              <span className="ornament-divider inline-flex text-divine-gold font-sans text-xs tracking-[0.3em] uppercase">
                About Us
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 text-royal-purple dark:text-white">
              Our <ShinyText text="Commitment" speed={3} color="var(--shiny-base, #1a0a3e)" shineColor="#d4a843" className="[--shiny-base:#1a0a3e] dark:[--shiny-base:#d4d4d8]" />
            </h2>
            <p className="font-sans text-gray-600 dark:text-white/60 font-light mt-4 max-w-2xl mx-auto leading-relaxed max-md:bg-white/50 dark:max-md:bg-black/50 max-md:backdrop-blur-md max-md:p-4 max-md:rounded-xl">
              As a proud business in Dehradun, we believe in honest guidance and providing the right materials for your needs. Here is what you can expect when you visit our shop.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="group"
            >
              <div className="bg-white dark:bg-white/5 border border-royal-purple/10 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 h-full flex flex-col items-center text-center relative overflow-hidden">
                {/* Background Hover Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-divine-gold/0 to-divine-gold/0 group-hover:from-divine-gold/[0.03] group-hover:to-transparent transition-all duration-500" />
                
                {/* Icon Container */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-royal-purple/5 dark:bg-white/5 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:bg-divine-gold/10 transition-all duration-500 relative">
                  <pillar.icon className="w-6 h-6 md:w-8 md:h-8 text-royal-purple dark:text-white group-hover:text-divine-gold transition-colors duration-500 relative z-10" />
                  <div className="absolute inset-0 border border-royal-purple/10 dark:border-white/10 rounded-2xl group-hover:border-divine-gold/30 transition-colors duration-500" />
                </div>

                <h3 className="font-serif text-xl md:text-2xl text-royal-purple dark:text-white mb-3 md:mb-4 relative z-10">
                  {pillar.title}
                </h3>
                <p className="font-sans text-sm md:text-base text-gray-600 dark:text-white/60 leading-relaxed relative z-10">
                  {pillar.description}
                </p>

                {/* Bottom decorative line */}
                <div className="w-12 h-1 bg-royal-purple/10 dark:bg-white/10 mt-6 md:mt-8 rounded-full group-hover:bg-divine-gold/50 group-hover:w-24 transition-all duration-500 relative z-10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
