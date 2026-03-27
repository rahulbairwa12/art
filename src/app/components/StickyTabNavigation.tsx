import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Music, Pencil, Trophy, Archive } from 'lucide-react';

interface StickyTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasCooldownBanner?: boolean;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'reflect', label: 'Reflect', icon: Pencil },
  { id: 'rewards', label: 'Rewards', icon: Trophy },
  { id: 'archive', label: 'Archive', icon: Archive },
];

export function StickyTabNavigation({ activeTab, onTabChange, hasCooldownBanner = false }: StickyTabNavigationProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topPosition = hasCooldownBanner ? 'top-[124px]' : 'top-16';

  return (
    <div 
      className={`
        sticky ${topPosition} z-40 transition-all duration-300
        ${isSticky ? 'bg-purple-900/95 backdrop-blur-md shadow-2xl' : 'bg-transparent'}
      `}
    >
      <div className="max-w-2xl mx-auto px-2 md:px-4 py-2 md:py-3">
        <div className="flex justify-around items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  console.log('Button clicked:', tab.id);
                  e.preventDefault();
                  e.stopPropagation();
                  onTabChange(tab.id);
                }}
                className="relative flex-1 group cursor-pointer pointer-events-auto"
                type="button"
              >
                <motion.div
                  className={`
                    flex flex-col items-center gap-1 py-2 px-2 md:px-3 rounded-lg transition-colors drop-shadow-lg
                    ${isActive 
                      ? 'text-yellow-300' 
                      : 'text-white/70 hover:text-white/90'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span 
                    className="text-[11px] md:text-xs font-black uppercase tracking-wide text-center"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {tab.label}
                  </span>
                </motion.div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-300 rounded-full"
                    style={{ pointerEvents: 'none' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}