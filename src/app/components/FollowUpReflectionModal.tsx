import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, Sparkles, BookOpen, MessageSquare, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface FollowUpReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokensEarned: number;
  onStartTimer: () => void;
  daysUntilNextPrompt: number;
}

export function FollowUpReflectionModal({
  isOpen,
  onClose,
  tokensEarned,
  onStartTimer,
  daysUntilNextPrompt
}: FollowUpReflectionModalProps) {
  const [hasStartedTimer, setHasStartedTimer] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasStartedTimer(false);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Setup embla
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const handleStartTimer = () => {
    setHasStartedTimer(true);
    onStartTimer();
    onClose();
  };

  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < 4; // 5 slides total (0-4)

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
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-2xl"
            >
              <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 border-8 border-yellow-400 shadow-2xl relative overflow-hidden">
                {/* Animated background patterns */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-16 h-16 border-4 border-white"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Carousel Container */}
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                      {/* Slide 1: Success Message */}
                      <div className="flex-[0_0_100%] min-w-0">
                        <h2
                          className="text-3xl md:text-4xl font-black text-center mb-4 text-white"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          🎉 Reflection Submitted!
                        </h2>

                        <div className="bg-white/90 rounded-xl p-4 md:p-6 mb-6 border-4 border-green-500">
                          <p
                            className="text-center text-lg md:text-xl font-black text-green-700"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            ✨ You earned {tokensEarned} Tokens!
                          </p>
                        </div>

                        <h3
                          className="text-xl md:text-2xl font-black text-center mb-6 text-yellow-300"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          ⚡ BONUS CHALLENGE: 2-MINUTE WINDOW! ⚡
                        </h3>

                        <div className="bg-white/95 rounded-xl p-6 mb-6">
                          <p
                            className="text-base md:text-lg font-bold text-gray-900 text-center"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            You'll have <span className="text-red-600 text-xl md:text-2xl font-black">2 minutes</span> to complete follow-up reflections and earn MORE Tokens!
                          </p>
                        </div>

                        <p
                          className="text-center text-white/90 text-sm font-bold mb-4"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          👉 Swipe to see all 3 bonus opportunities
                        </p>
                      </div>

                      {/* Slide 2: Archive Reflection */}
                      <div className="flex-[0_0_100%] min-w-0 px-2">
                        <div className="bg-white/95 rounded-xl p-6 border-4 border-purple-300 h-full flex flex-col">
                          <div className="flex items-center justify-center mb-4">
                            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-purple-600" />
                          </div>
                          
                          <h3
                            className="text-xl md:text-2xl font-black text-purple-900 mb-4 text-center"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            Reflect on Archive Entry
                          </h3>
                          
                          <p
                            className="text-base font-bold text-gray-700 mb-4 text-center"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            Read a reflection from another visitor and respond with your thoughts.
                          </p>
                          
                          <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                            <p
                              className="text-sm font-bold text-center text-gray-600 mb-2"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              💎 Token Rewards:
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 20-49 words: +50 Tokens
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 50-99 words: +100 Tokens
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 100+ words: +150 Tokens
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Slide 3: Response to Your Reflection */}
                      <div className="flex-[0_0_100%] min-w-0 px-2">
                        <div className="bg-white/95 rounded-xl p-6 border-4 border-blue-300 h-full flex flex-col">
                          <div className="flex items-center justify-center mb-4">
                            <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
                          </div>
                          
                          <h3
                            className="text-xl md:text-2xl font-black text-blue-900 mb-4 text-center"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            Response to Your Reflection
                          </h3>
                          
                          <p
                            className="text-base font-bold text-gray-700 mb-4 text-center"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            If someone responded to your reflection, continue the conversation!
                          </p>
                          
                          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                            <p
                              className="font-bold text-blue-600 text-center"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              💎 Token Rewards:
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 20-49 words: +50 Tokens
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 50-99 words: +100 Tokens
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 100+ words: +150 Tokens
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Slide 4: Reflection Chain */}
                      <div className="flex-[0_0_100%] min-w-0 px-2">
                        <div className="bg-white/95 rounded-xl p-6 border-4 border-green-300 h-full flex flex-col">
                          <div className="flex items-center justify-center mb-4">
                            <LinkIcon className="w-12 h-12 md:w-16 md:h-16 text-green-600" />
                          </div>
                          
                          <h3
                            className="text-xl md:text-2xl font-black text-green-900 mb-4 text-center"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            Reflection Chain
                          </h3>
                          
                          <p
                            className="text-base font-bold text-gray-700 mb-4 text-center"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            Build on your initial reflection by adding deeper insights or connections.
                          </p>
                          
                          <div className="bg-green-50 rounded-lg p-4 space-y-2">
                            <p
                              className="font-bold text-green-600 text-center"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              💎 Token Rewards:
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 20-49 words: +50 Tokens
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 50-99 words: +100 Tokens
                            </p>
                            <p className="text-sm font-bold text-gray-700 text-center">
                              • 100+ words: +150 Tokens
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Slide 5: Final Warning & Action */}
                      <div className="flex-[0_0_100%] min-w-0">
                        <h3
                          className="text-2xl md:text-3xl font-black text-center mb-6 text-yellow-300"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          ⏰ Ready to Start?
                        </h3>

                        <div className="bg-red-100 rounded-xl p-5 mb-6 border-4 border-red-500 space-y-3">
                          <p
                            className="text-center text-lg md:text-xl font-black text-red-800"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            ⚠️ THIS IS YOUR ONLY CHANCE!
                          </p>
                          <p
                            className="text-center text-sm md:text-base font-bold text-red-700"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            After this 2-minute window expires, you won't be able to earn more Tokens until the next prompt in <span className="font-black text-lg md:text-xl">{daysUntilNextPrompt} {daysUntilNextPrompt === 1 ? 'day' : 'days'}</span>!
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={handleStartTimer}
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-black text-lg md:text-xl py-6 md:py-8 shadow-xl border-4 border-white"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                            I Understand - Start Timer!
                          </Button>

                          <Button
                            onClick={onClose}
                            variant="outline"
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold text-base md:text-lg py-4 md:py-6 border-4 border-gray-400"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            No Thanks - I'll Pass
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    {/* Previous Button */}
                    <button
                      onClick={scrollPrev}
                      disabled={!canScrollPrev}
                      className={`p-3 rounded-full transition-all ${
                        canScrollPrev
                          ? 'bg-white/90 hover:bg-white text-purple-900 hover:scale-110'
                          : 'bg-white/20 text-white/30 cursor-not-allowed'
                      }`}
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <button
                          key={index}
                          onClick={() => scrollTo(index)}
                          className={`transition-all rounded-full ${
                            index === selectedIndex
                              ? 'w-10 h-3 bg-yellow-400'
                              : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={scrollNext}
                      disabled={!canScrollNext}
                      className={`p-3 rounded-full transition-all ${
                        canScrollNext
                          ? 'bg-white/90 hover:bg-white text-purple-900 hover:scale-110'
                          : 'bg-white/20 text-white/30 cursor-not-allowed'
                      }`}
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Slide Counter */}
                  <p
                    className="text-center text-white/70 text-sm mt-4 font-bold"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {selectedIndex + 1} of 5
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}