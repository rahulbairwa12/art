import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap } from 'lucide-react';

interface BonusReflectionTimerProps {
  endTime: number;
  onTimeEnd: () => void;
  hasCooldownBanner?: boolean;
}

export function BonusReflectionTimer({ endTime, onTimeEnd, hasCooldownBanner = false }: BonusReflectionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        onTimeEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeEnd]);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  const isLowTime = minutes === 0 && seconds <= 30;
  
  // Calculate top position based on whether cooldown banner is visible
  // Back button banner is ~52px, cooldown banner is ~64px
  const topPosition = hasCooldownBanner ? 'top-[116px]' : 'top-[52px]';

  return (
    <AnimatePresence>
      {timeRemaining > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className={`fixed ${topPosition} left-0 right-0 z-[110] pointer-events-none`}
        >
          <div className="max-w-2xl mx-auto px-4 pt-4">
            <motion.div
              className={`
                backdrop-blur-xl rounded-2xl shadow-2xl border-4 p-4 pointer-events-auto
                ${isLowTime 
                  ? 'bg-red-500/95 border-red-700' 
                  : 'bg-gradient-to-r from-purple-500/95 to-pink-500/95 border-yellow-400'
                }
              `}
              animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isLowTime ? (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Zap className="w-7 h-7 text-white fill-white" />
                    </motion.div>
                  ) : (
                    <Clock className="w-7 h-7 text-white" />
                  )}
                  <div>
                    <p className="text-white font-black text-lg md:text-xl leading-tight"
                       style={{ fontFamily: 'var(--font-heading)' }}>
                      {isLowTime ? 'HURRY! BONUS WINDOW CLOSING!' : 'BONUS REFLECTION WINDOW'}
                    </p>
                    <p className="text-white/90 text-sm font-semibold"
                       style={{ fontFamily: 'var(--font-body)' }}>
                      Submit another reflection for extra tokens!
                    </p>
                  </div>
                </div>
                
                <motion.div
                  className={`
                    px-6 py-3 rounded-xl font-black text-2xl md:text-3xl border-4
                    ${isLowTime 
                      ? 'bg-white text-red-600 border-red-800' 
                      : 'bg-yellow-400 text-purple-900 border-yellow-600'
                    }
                  `}
                  style={{ fontFamily: 'var(--font-heading)' }}
                  animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}