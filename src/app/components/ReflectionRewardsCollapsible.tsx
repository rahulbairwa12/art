import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Gift } from 'lucide-react';

export function ReflectionRewardsCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl border-4 border-purple-400 shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-purple-600" />
          <span 
            className="font-black text-lg text-purple-900 uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Reflection Rewards
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-purple-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700">20-49 words:</span>
                  <span className="font-black text-yellow-600">+50 Tokens</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700">50-99 words:</span>
                  <span className="font-black text-orange-600">+100 Tokens</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-700">100+ words:</span>
                  <span className="font-black text-purple-600">+150 Tokens</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
