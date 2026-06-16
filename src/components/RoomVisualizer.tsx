import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Box } from 'lucide-react';

interface RoomVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string | null;
  productName: string | null;
}

export function RoomVisualizer({ isOpen, onClose, productImage, productName }: RoomVisualizerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <div className="absolute inset-0 z-0" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-5xl h-[80vh] bg-deep-black border border-divine-gold/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div>
                <h3 className="font-serif text-2xl text-divine-gold">Live Visualizer</h3>
                <p className="font-sans text-sm text-white/60 mt-1">Previewing: {productName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visualizer Area */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-royal-purple/20 to-black/90 flex items-center justify-center perspective-[1000px]">
              
              {/* Virtual Room Walls */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute left-0 bottom-0 w-1/2 h-[60%] bg-gradient-to-tr from-black to-transparent" />
                <div className="absolute right-0 bottom-0 w-1/2 h-[60%] bg-gradient-to-tl from-black to-transparent" />
              </div>

              {/* 3D Floor with Tile Pattern */}
              <motion.div
                initial={{ rotateX: 60, rotateZ: -45, y: 100, opacity: 0 }}
                animate={{ rotateX: 60, rotateZ: -45, y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="w-[150%] md:w-[800px] h-[150%] md:h-[800px] absolute"
                style={{
                  backgroundImage: productImage ? `url(${productImage})` : 'none',
                  backgroundSize: '150px 150px',
                  backgroundRepeat: 'repeat',
                  transformStyle: 'preserve-3d',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                }}
              >
                {/* Lighting gradient overlay over the floor */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </motion.div>
              
              {/* Overlay Instructions */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full glass-light dark:glass border border-divine-gold/30 text-white/80 text-sm font-sans flex items-center gap-2">
                <Box className="w-4 h-4 text-divine-gold" />
                Virtual Floor Scale: 600x1200mm mapped
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
