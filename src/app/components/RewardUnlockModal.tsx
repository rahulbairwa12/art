import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles, Copy, X } from 'lucide-react';
import { toast } from 'sonner';

interface RewardUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardTierData: { tokens: number; discount: number; code: string };
  onRedeem: () => void;
  daysUntilExpiration: number;
  onCloseComplete?: () => void;
}

export function RewardUnlockModal({ isOpen, onClose, rewardTierData, onRedeem, daysUntilExpiration, onCloseComplete }: RewardUnlockModalProps) {
  if (!rewardTierData) return null;

  const handleRedeem = () => {
    onRedeem();
    onClose();
  };

  const handleClose = () => {
    onClose();
    if (onCloseComplete) {
      onCloseComplete();
    }
  };

  const copyCode = async () => {
    let copySuccessful = false;
    
    try {
      // Try modern Clipboard API first with proper error handling
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(rewardTierData.code);
          copySuccessful = true;
        }
      } catch (clipboardError) {
        // Clipboard API blocked or failed, try fallback
        console.log('Clipboard API not available, using fallback');
      }
      
      // If clipboard API failed, use fallback method
      if (!copySuccessful) {
        const textArea = document.createElement('textarea');
        textArea.value = rewardTierData.code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          textArea.remove();
          if (!successful) {
            throw new Error('Copy command failed');
          }
          copySuccessful = true;
        } catch (err) {
          textArea.remove();
          throw new Error('Copy failed');
        }
      }
      
      toast.success('Code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Unable to copy automatically', {
        description: `Please manually copy this code: ${rewardTierData.code}`,
        duration: 8000,
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-md p-0 overflow-y-auto max-h-[90vh] border-accent/30">
            <DialogTitle className="sr-only">Reward Unlocked</DialogTitle>
            <DialogDescription className="sr-only">
              You've unlocked {rewardTierData.discount}% off the Vibes & Virtues store with code {rewardTierData.code}
            </DialogDescription>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative"
            >
              {/* Background gradient animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              <div className="relative p-8">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-foreground/40 hover:text-foreground/80 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Animated sparkles */}
                <motion.div
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <div className="relative">
                    <Sparkles className="w-16 h-16 text-accent" />
                    
                    {/* Orbiting sparkles */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: Math.cos((i * Math.PI) / 2) * 40,
                          y: Math.sin((i * Math.PI) / 2) * 40,
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.1,
                          repeat: Infinity,
                          repeatType: 'loop',
                        }}
                      >
                        <Sparkles className="w-4 h-4 text-accent/60" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-2xl font-semibold text-center text-accent mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Reward Unlocked
                </motion.h2>

                {/* Description */}
                <motion.p
                  className="text-center text-foreground/70 mb-6"
                  style={{ fontFamily: 'var(--font-body)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Congratulations — you've unlocked <span className="font-semibold text-accent">{rewardTierData.discount}% off</span> the Vibes & Virtues store.
                </motion.p>

                {/* Discount badge */}
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <div className="px-6 py-3 bg-accent/20 border-2 border-accent rounded-lg">
                    <p className="text-4xl font-bold text-accent"
                       style={{ fontFamily: 'var(--font-heading)' }}>
                      {rewardTierData.discount}% OFF
                    </p>
                  </div>
                </motion.div>

                {/* Choice Section */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-center text-foreground/80 font-semibold mb-6"
                     style={{ fontFamily: 'var(--font-body)' }}>
                    What would you like to do?
                  </p>

                  {/* Option 1: Redeem Now */}
                  <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-accent mb-2"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                      🎁 Redeem Now
                    </h3>
                    <p className="text-sm text-foreground/70 mb-2"
                       style={{ fontFamily: 'var(--font-body)' }}>
                      Get your {rewardTierData.discount}% off coupon code immediately. Your Tokens will be deducted ({rewardTierData.tokens} Tokens).
                    </p>
                    <p className="text-sm text-red-600 font-black mb-4"
                       style={{ fontFamily: 'var(--font-body)' }}>
                      ⏰ Coupon expires in 14 days!
                    </p>
                    <Button
                      onClick={handleRedeem}
                      className="w-full bg-accent hover:bg-accent/90 text-background font-bold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Redeem for Coupon Code
                    </Button>
                  </div>

                  {/* Option 2: Save Tokens */}
                  <div className="bg-background/50 border-2 border-foreground/20 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-foreground/90 mb-2"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                      💎 Save & Keep Earning
                    </h3>
                    <p className="text-sm text-foreground/70 mb-4"
                       style={{ fontFamily: 'var(--font-body)' }}>
                      Keep your Tokens and continue earning towards higher rewards. You have {daysUntilExpiration} days before your Tokens expire.
                    </p>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="w-full border-foreground/30 text-foreground/90 hover:bg-foreground/10 font-bold"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Continue Earning
                    </Button>
                  </div>

                  <p className="text-xs text-center text-foreground/50 mt-4"
                     style={{ fontFamily: 'var(--font-body)' }}>
                    💡 Tip: Higher Vibe Token milestones unlock bigger discounts!
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}