import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sparkles } from 'lucide-react';

interface CooldownBannerProps {
  nextAvailableDate: string;
}

export function CooldownBanner({ nextAvailableDate }: CooldownBannerProps) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const nextDate = new Date(nextAvailableDate);
      const now = new Date();
      const diff = nextDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setDaysRemaining(days);
        setHoursRemaining(hours);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextAvailableDate]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg"
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-white">
            <Clock className="w-5 h-5 animate-pulse" />
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <p className="font-black text-sm md:text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                Next Prompt Available In:
              </p>
              <div className="flex items-center gap-1.5">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border-2 border-white/40">
                  <span className="text-xl md:text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                    {daysRemaining}
                  </span>
                  <span className="text-xs ml-1 font-bold">
                    {daysRemaining === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border-2 border-white/40">
                  <span className="text-xl md:text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                    {hoursRemaining}
                  </span>
                  <span className="text-xs ml-1 font-bold">
                    {hoursRemaining === 1 ? 'hr' : 'hrs'}
                  </span>
                </div>
              </div>
            </div>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}