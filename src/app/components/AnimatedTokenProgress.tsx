import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Sparkles, CheckCircle2, Clock, Copy, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface AnimatedTokenProgressProps {
  tokens: number;
  expiresAt: string;
  unlockedRewards: number[];
  redeemedRewards?: number[];
  userId?: string;
  themeId?: string;
  onRedeemCode?: (rewardTier: number) => void;
  onTokenChange?: (newTokens: number) => void;
  rewardTiers?: Array<{ tokens: number; discount: number; code: string }>;
}

const DEFAULT_REWARD_TIERS = [
  { tokens: 100, discount: 10, code: 'VIBE10' },
  { tokens: 250, discount: 20, code: 'VIBE20' },
  { tokens: 500, discount: 30, code: 'VIBE30' },
  { tokens: 750, discount: 40, code: 'VIBE40' },
  { tokens: 1000, discount: 50, code: 'VIBE50' },
];

export function AnimatedTokenProgress({
  tokens,
  expiresAt,
  unlockedRewards,
  redeemedRewards = [],
  userId,
  themeId,
  onRedeemCode,
  onTokenChange,
  rewardTiers = DEFAULT_REWARD_TIERS
}: AnimatedTokenProgressProps) {
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [localRedeemedRewards, setLocalRedeemedRewards] = useState<number[]>(redeemedRewards);
  
  // Use provided reward tiers or default
  const REWARD_TIERS = rewardTiers;
  
  // Animated token counter
  const animatedTokens = useMotionValue(0);
  const springTokens = useSpring(animatedTokens, {
    stiffness: 60,
    damping: 20,
    mass: 1
  });

  useEffect(() => {
    animatedTokens.set(tokens);
  }, [tokens]);

  useEffect(() => {
    setLocalRedeemedRewards(redeemedRewards);
  }, [redeemedRewards]);

  // Calculate days remaining
  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      
      if (isNaN(expires.getTime())) {
        // Fallback to 90 days from now if date is invalid
        setDaysRemaining(90);
        return;
      }

      const diff = expires.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const validDays = isNaN(days) ? 0 : Math.max(0, days);
      setDaysRemaining(validDays);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // Update hourly
    return () => clearInterval(interval);
  }, [expiresAt]);

  const nextReward = REWARD_TIERS.find(tier => tokens < tier.tokens);
  const progressToNext = nextReward
    ? ((tokens % nextReward.tokens) / nextReward.tokens) * 100
    : 100;

  const copyCodeAndMarkRedeemed = async (code: string, rewardTier: number) => {
    let copySuccessful = false;
    
    try {
      // Try modern Clipboard API first with proper error handling
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(code);
          copySuccessful = true;
        }
      } catch (clipboardError) {
        // Clipboard API blocked or failed, try fallback
        console.log('Clipboard API not available, using fallback');
      }
      
      // If clipboard API failed, use fallback method
      if (!copySuccessful) {
        const textArea = document.createElement('textarea');
        textArea.value = code;
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
      
      toast.success('Code copied to clipboard!', {
        description: 'This code has been marked as redeemed and can no longer be accessed.',
      });
      
      // Mark as redeemed locally
      setLocalRedeemedRewards([...localRedeemedRewards, rewardTier]);
      
      // Notify parent component
      if (onRedeemCode) {
        onRedeemCode(rewardTier);
      }
      
      // Close the selected reward after a short delay
      setTimeout(() => {
        setSelectedReward(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Unable to copy automatically', {
        description: `Please manually copy this code: ${code}`,
        duration: 8000,
      });
      
      // Still mark as redeemed even if copy failed
      setLocalRedeemedRewards([...localRedeemedRewards, rewardTier]);
      
      if (onRedeemCode) {
        onRedeemCode(rewardTier);
      }
    }
  };

  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;

  return (
    <div>
      {/* Expiration Alert */}
      {isExpiringSoon && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-accent mb-1"
                 style={{ fontFamily: 'var(--font-heading)' }}>
                Your Tokens expire soon.
              </p>
              <p className="text-xs text-foreground/60 mb-3"
                 style={{ fontFamily: 'var(--font-body)' }}>
                Respond to the latest reflection prompt to keep your tokens active.
              </p>
              <a
                href="#reflection-prompt"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                View Latest Prompt <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="p-6 md:p-8 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/30">
        {/* Token Display */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm text-foreground/80 font-black uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-heading)' }}>
              Tokens Earned
            </span>
          </div>
          
          <motion.p
            className="text-4xl md:text-5xl font-semibold text-accent"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {Math.round(springTokens.get())}
          </motion.p>
        </div>

        {/* Animated Progress Bar */}
        {nextReward && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-foreground/80 font-bold mb-2"
                 style={{ fontFamily: 'var(--font-body)' }}>
              <span>Current: {tokens} Tokens</span>
              <span>Next: {nextReward.discount}% off</span>
            </div>

            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent/60 to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <p className="text-sm text-center text-foreground/70 font-bold mt-2"
               style={{ fontFamily: 'var(--font-body)' }}>
              {nextReward.tokens - tokens} more Tokens to unlock {nextReward.discount}% off
            </p>
          </div>
        )}

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-4 relative h-0.5 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Milestone Tracker */}
        <div className="mb-3">
          <p className="text-sm font-black text-center mb-3 uppercase tracking-wide text-foreground/90"
             style={{ fontFamily: 'var(--font-heading)' }}>
            Reward Milestones
          </p>

          <div className="relative px-2">
            {/* Connection line */}
            <div className="absolute top-6 left-4 right-4 h-0.5 bg-muted/50" />

            {/* Milestone nodes */}
            <div className="relative flex justify-center items-start gap-3 md:gap-4">
              {REWARD_TIERS.map((tier, index) => {
                const isUnlocked = tokens >= tier.tokens;
                const isRedeemed = localRedeemedRewards.includes(tier.tokens);
                const isCurrent = tokens >= tier.tokens && (!REWARD_TIERS[index + 1] || tokens < REWARD_TIERS[index + 1].tokens);

                return (
                  <button
                    key={tier.tokens}
                    onClick={() => isUnlocked && !isRedeemed && setSelectedReward(tier.tokens)}
                    className="flex flex-col items-center group relative"
                    disabled={!isUnlocked || isRedeemed}
                  >
                    <motion.div
                      className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center relative z-10 transition-all
                        ${isRedeemed
                          ? 'bg-gray-400 border-gray-400 cursor-not-allowed'
                          : isUnlocked
                          ? 'bg-accent border-accent shadow-lg cursor-pointer hover:scale-110'
                          : 'bg-muted border-muted-foreground/20'
                        }
                        ${isCurrent && !isRedeemed ? 'ring-4 ring-accent/20' : ''}
                      `}
                      initial={false}
                      animate={{
                        scale: isCurrent && !isRedeemed ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isCurrent && !isRedeemed ? Infinity : 0,
                        repeatType: 'reverse',
                      }}
                    >
                      {isRedeemed ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      ) : isUnlocked ? (
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-background" />
                      ) : (
                        <span className="text-[10px] md:text-xs font-bold text-foreground/40"
                              style={{ fontFamily: 'var(--font-heading)' }}>
                          {tier.tokens}
                        </span>
                      )}

                      {/* Glow effect for unlocked */}
                      {isUnlocked && !isRedeemed && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-accent/30"
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0, 0.5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: 'loop',
                          }}
                        />
                      )}
                    </motion.div>

                    <div className="mt-1.5 text-center">
                      <p className={`text-[10px] md:text-xs font-black ${isRedeemed ? 'text-gray-400' : isUnlocked ? 'text-accent' : 'text-foreground/40'}`}
                         style={{ fontFamily: 'var(--font-heading)' }}>
                        {tier.discount}% off
                      </p>
                      <p className="text-[9px] md:text-[10px] text-foreground/60 font-bold"
                         style={{ fontFamily: 'var(--font-body)' }}>
                        {tier.tokens}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanatory text */}
          <p className="text-xs text-center text-foreground/70 font-bold mt-4 px-2"
             style={{ fontFamily: 'var(--font-body)' }}>
            ✨ <span className="text-accent">Tap any unlocked reward circle</span> to access your discount code. Once copied, codes are marked as redeemed and cannot be accessed again.
          </p>
        </div>

        {/* Selected Reward Card */}
        {selectedReward && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <Card className="p-6 bg-accent/10 border-accent/30">
              {(() => {
                const reward = REWARD_TIERS.find(t => t.tokens === selectedReward);
                if (!reward) return null;

                const isRedeemed = localRedeemedRewards.includes(reward.tokens);

                return (
                  <>
                    <div className="text-center mb-4">
                      <p className="text-sm font-semibold text-accent mb-1"
                         style={{ fontFamily: 'var(--font-heading)' }}>
                        Reward Unlocked
                      </p>
                      <p className="text-xs text-foreground/70"
                         style={{ fontFamily: 'var(--font-body)' }}>
                        Congratulations — you've unlocked {reward.discount}% off the Vibes & Virtues store.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-background/50 border border-accent/20 rounded px-4 py-3 text-center">
                        <p className="text-lg font-bold text-accent tracking-wider"
                           style={{ fontFamily: 'var(--font-heading)' }}>
                          {reward.code}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyCodeAndMarkRedeemed(reward.code, reward.tokens)}
                        disabled={isRedeemed}
                        className={`${isRedeemed ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-accent/90'} text-background`}
                      >
                        {isRedeemed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <p className="text-xs text-center text-foreground/50"
                       style={{ fontFamily: 'var(--font-body)' }}>
                      {isRedeemed 
                        ? '✓ Code copied! This code has been marked as redeemed.' 
                        : '⚠️ Once you copy this code, it will be marked as redeemed and cannot be accessed again.'}
                    </p>
                  </>
                );
              })()}
            </Card>
          </motion.div>
        )}

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-4 relative h-0.5 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Token Expiration */}
        <div>
          <p className="text-sm font-semibold text-center mb-3"
             style={{ fontFamily: 'var(--font-heading)' }}>
            Token Expiration
          </p>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative w-16 h-16">
              {/* Countdown ring */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted/50"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className={isExpiringSoon ? 'text-accent' : 'text-accent/60'}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{
                    strokeDashoffset: (1 - (daysRemaining / 90)) * 2 * Math.PI * 28
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-accent"
                      style={{ fontFamily: 'var(--font-heading)' }}>
                  {daysRemaining}
                </span>
              </div>
            </div>

            <div>
              <p className="text-base font-medium text-foreground/80"
                 style={{ fontFamily: 'var(--font-body)' }}>
                Your Tokens expire in
              </p>
              <p className="text-2xl font-semibold text-accent"
                 style={{ fontFamily: 'var(--font-heading)' }}>
                {daysRemaining} days
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-foreground/50"
             style={{ fontFamily: 'var(--font-body)' }}>
            Tokens expire after 3 months.
          </p>
        </div>

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-4 relative h-0.5 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Reflection Depth Guide */}
        <div>
          <p className="text-sm font-black text-center mb-3 uppercase tracking-wide text-foreground/90"
             style={{ fontFamily: 'var(--font-heading)' }}>
            How to Earn Tokens
          </p>

          <div className="space-y-2 text-sm text-foreground/80 font-bold"
               style={{ fontFamily: 'var(--font-body)' }}>
            <p>• Short reflection (20-49 words): +50 Tokens</p>
            <p>• Medium reflection (50-99 words): +100 Tokens</p>
            <p>• Deep reflection (100+ words): +150 Tokens</p>
          </div>

          <p className="text-sm text-center text-foreground/70 font-bold mt-4"
             style={{ fontFamily: 'var(--font-body)' }}>
            Tokens represent contributions to the Wildcard Cultural Archive through thoughtful reflection.
          </p>
        </div>
      </Card>
    </div>
  );
}