import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
  playClickSound: () => void;
  playSplashSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(1.0);
  
  // Audio references
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const splashAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio objects
    ambientAudioRef.current = new Audio('/flute.mp3');
    ambientAudioRef.current.loop = true;
    ambientAudioRef.current.volume = 0; // Start at 0 for fade

    clickAudioRef.current = new Audio('/chime.mp3');
    clickAudioRef.current.volume = 0.6; // Slightly louder for clicks

    splashAudioRef.current = new Audio('/splash.mp3');
    splashAudioRef.current.volume = 0.7;

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
      if (clickAudioRef.current) {
        clickAudioRef.current = null;
      }
      if (splashAudioRef.current) {
        splashAudioRef.current = null;
      }
    };
  }, []);

  // Browser Autoplay Policy workaround
  useEffect(() => {
    const unlockAudio = () => {
      if (ambientAudioRef.current) {
        // threshold at the end of the 500vh hero animation section
        const threshold = window.innerHeight * 3.5;
        // Attempt to play to unlock the audio context
        const playPromise = ambientAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // If we are below the threshold and not muted, keep playing, else pause
            if (window.scrollY <= threshold || isMuted) {
              ambientAudioRef.current?.pause();
            }
          }).catch(() => {});
        }
      }
      // Remove listeners after first interaction
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [isMuted]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ambientAudioRef.current || isMuted) {
        if (ambientAudioRef.current) ambientAudioRef.current.pause();
        return;
      }
      
      // Hero canvas section is 300vh on mobile and 500vh on desktop
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? window.innerHeight * 2.0 : window.innerHeight * 3.5;
      const scrollY = window.scrollY;
      
      if (scrollY > threshold) {
        // Fade in
        if (ambientAudioRef.current.paused) {
          ambientAudioRef.current.play().catch(() => {});
        }
        const progress = Math.min((scrollY - threshold) / 500, 1);
        ambientAudioRef.current.volume = progress * 0.3 * masterVolume; // Max volume 0.3 * masterVolume
      } else {
        // Fade out
        if (!ambientAudioRef.current.paused) {
           const progress = Math.max(0, 1 - (threshold - scrollY) / 500);
           ambientAudioRef.current.volume = progress * 0.3 * masterVolume;
           if (progress === 0) {
             ambientAudioRef.current.pause();
           }
        }
      }
    };

    // Initial check and setup listener
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMuted, masterVolume]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const playClickSound = () => {
    if (!isMuted && clickAudioRef.current) {
      // Reset time to allow rapid clicking
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(e => {
        console.warn("Click sound playback failed:", e);
      });
    }
  };

  const playSplashSound = () => {
    if (!isMuted && splashAudioRef.current) {
      splashAudioRef.current.currentTime = 0;
      splashAudioRef.current.play().catch(e => {
        console.warn("Splash sound playback failed:", e);
      });
    }
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, masterVolume, setMasterVolume, playClickSound, playSplashSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};
