import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { AnimatedTokenProgress } from './AnimatedTokenProgress';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface RedeemTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: number;
  expiresAt: string;
  unlockedRewards: number[];
  redeemedRewards?: number[];
  userId?: string;
  themeId?: string;
  onRedeemCode?: (rewardTier: number) => void;
}

export function RedeemTokensModal({
  isOpen, 
  onClose, 
  tokens, 
  expiresAt, 
  unlockedRewards, 
  redeemedRewards = [], 
  userId, 
  themeId,
  onRedeemCode
}: RedeemTokensModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-md p-0 overflow-y-auto max-h-[90vh] bg-white border-yellow-400">
            <DialogTitle className="sr-only">Redeem Tokens</DialogTitle>
            <DialogDescription className="sr-only">
              Track your Tokens and unlock exclusive rewards.
            </DialogDescription>
            <div className="relative p-6 pt-10">
              <h2 className="text-2xl font-black mb-6 mt-4 text-center text-gray-900 drop-shadow-sm flex items-center justify-center gap-3"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Redeem Rewards
              </h2>

              <AnimatedTokenProgress
                tokens={tokens}
                expiresAt={expiresAt}
                unlockedRewards={unlockedRewards}
                redeemedRewards={redeemedRewards}
                userId={userId}
                themeId={themeId}
                onRedeemCode={onRedeemCode}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
