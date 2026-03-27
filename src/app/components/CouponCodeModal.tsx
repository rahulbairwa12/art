import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, Sparkles, Gift } from 'lucide-react';
import { toast } from 'sonner';

interface CouponCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
  code: string;
  tokensRedeemed: number;
  onCloseComplete?: () => void;
}

export function CouponCodeModal({
  isOpen,
  onClose,
  discount,
  code,
  tokensRedeemed,
  onCloseComplete
}: CouponCodeModalProps) {
  const handleClose = () => {
    onClose();
    if (onCloseComplete) {
      onCloseComplete();
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Coupon code copied!', {
        description: 'Paste it at checkout in the Vibes & Virtues store.',
      });
    } catch (error) {
      // Fallback for when clipboard API is not available
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Coupon code copied!', {
          description: 'Paste it at checkout in the Vibes & Virtues store.',
        });
      } catch (err) {
        toast.error('Failed to copy code. Please copy manually: ' + code);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <Card className="p-8 bg-gradient-to-br from-yellow-50 to-amber-100 border-8 border-yellow-600 shadow-2xl relative overflow-hidden">
                {/* Confetti background effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: ['#FCD34D', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'][i % 5],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        rotate: [0, 360],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="relative">
                      <Gift className="w-20 h-20 text-yellow-600" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-2 -right-2"
                      >
                        <Sparkles className="w-8 h-8 text-amber-500" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <h2
                    className="text-3xl md:text-4xl font-black text-center mb-3 text-gray-900"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    🎉 Reward Unlocked!
                  </h2>

                  <p
                    className="text-xl font-bold text-center mb-6 text-gray-700"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    You've earned {discount}% off the Vibes & Virtues store!
                  </p>

                  {/* Token deduction notice */}
                  <div className="bg-white/80 rounded-xl p-4 mb-6 border-4 border-yellow-500">
                    <p
                      className="text-center text-sm font-bold text-gray-700"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      ✨ {tokensRedeemed} Tokens redeemed for this coupon
                    </p>
                  </div>

                  {/* Coupon Code Display */}
                  <div className="bg-white rounded-xl p-6 mb-6 border-4 border-yellow-600 shadow-inner">
                    <p
                      className="text-sm font-bold text-center mb-2 text-gray-600 uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Your Coupon Code
                    </p>
                    <p
                      className="text-4xl font-black text-center mb-4 text-yellow-700 tracking-widest"
                      style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}
                    >
                      {code}
                    </p>
                    <Button
                      onClick={copyCode}
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold text-lg py-6 shadow-xl"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Coupon Code
                    </Button>
                  </div>

                  <p
                    className="text-center text-sm font-bold text-gray-600 mb-6"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Use this code at checkout in the Vibes & Virtues web store to redeem your discount!
                  </p>

                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full border-4 border-yellow-600 bg-white hover:bg-yellow-50 text-yellow-800 font-bold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Continue Exploring
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
