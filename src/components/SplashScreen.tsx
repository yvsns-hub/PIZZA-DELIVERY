import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';
import { ease } from '../lib/animations.js';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const shouldReduce = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if splash has already been seen in this session
    const seen = sessionStorage.getItem('pizza_splash_seen');
    if (seen) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('pizza_splash_seen', 'true');
      setIsVisible(false);
      setTimeout(onComplete, 450); // wait for exit animation
    }, shouldReduce ? 400 : 1800);

    return () => clearTimeout(timer);
  }, [onComplete, shouldReduce]);

  const handleSkip = () => {
    sessionStorage.setItem('pizza_splash_seen', 'true');
    setIsVisible(false);
    setTimeout(onComplete, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950 text-stone-100 select-none overflow-hidden cursor-pointer"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: ease.inOut }}
        >
          {/* Ambient Warm Hearth Glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle 350px at 50% 50%, rgba(234, 88, 12, 0.25) 0%, transparent 70%),
                radial-gradient(circle 500px at 50% 40%, rgba(217, 119, 6, 0.15) 0%, transparent 60%),
                #0c0a09
              `,
            }}
          />

          {/* Central Animated Brand Badge */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            {/* Hearth Aperture Ring with Rotating Ember Glow */}
            <motion.div
              className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6 flex items-center justify-center"
              initial={shouldReduce ? false : { scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: ease.out }}
            >
              {/* Outer Glowing Hearth Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-500/40"
                animate={shouldReduce ? undefined : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                style={{
                  boxShadow: '0 0 35px rgba(234, 88, 12, 0.45), inset 0 0 25px rgba(217, 119, 6, 0.3)',
                }}
              />

              {/* Inner Dashed Ring */}
              <div
                aria-hidden="true"
                className="absolute inset-2 rounded-full border border-dashed border-amber-500/30"
              />

              {/* Pizza Artisan Flame Core */}
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/50"
                initial={shouldReduce ? false : { scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.5, delay: 0.15, ease: ease.out }}
              >
                <Flame className="w-9 h-9 text-stone-950 fill-stone-950" />
              </motion.div>
            </motion.div>

            {/* Brand Title Stagger Reveal */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase mb-2"
              initial={shouldReduce ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: ease.out }}
            >
              Pizza Artisan
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-xs sm:text-sm font-light text-amber-300 tracking-widest uppercase mb-4"
              initial={shouldReduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              Handcrafted Wood-Fired Mastery
            </motion.p>

            {/* Subtle Click to skip hint */}
            <motion.span
              className="text-[11px] font-mono text-stone-500 tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8 }}
            >
              Click anywhere to proceed →
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
