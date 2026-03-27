'use client';

import { User } from '@supabase/supabase-js';
import { Button } from './ui/button';
import { LogOut, User as UserIcon, Puzzle, Sparkles, Menu, X, ChevronDown, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { RedeemTokensModal } from './RedeemTokensModal';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  tokens?: number;
  themeTitle?: string;
  variant?: 'portal' | 'theme';
  themeData?: any;
  onLoginRequest?: () => void;
}

export function Header({ user, onLogout, tokens, themeTitle, variant = 'portal', themeData, onLoginRequest }: HeaderProps) {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWildcardOpen, setIsWildcardOpen] = useState(false);

  // Logo + nav header when not logged in
  if (!user && !themeTitle) {
    const navItems = [
      { label: 'Shop', href: 'https://vibesandvirtues.com', isExternal: true },
    ];

    const wildcardItems = [
      { label: 'What is Wildcard?', href: 'https://vibesandvirtues.com/pages/wildcard' },
      { label: 'Enter Wildcard', href: 'https://vibesandvirtues.com/pages/enter-wildcard' },
      { label: 'Host Wildcard', href: 'https://vibesandvirtues.com/pages/host-wildcard' },
      { label: 'The Current Theme', href: 'https://vibesandvirtues.com/pages/current-theme' },
      { label: 'Puzzle Artworks', href: 'https://vibesandvirtues.com/pages/puzzle-artworks' },
      { label: 'Music Projects', href: 'https://vibesandvirtues.com/pages/music-projects' },
    ];

    return (
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 bg-black border-b border-white/5 shadow-xl"
      >
        <div className="max-w-[1200px] mx-auto flex justify-between items-center relative">
          <img
            src="https://vibesandvirtues.com/cdn/shop/files/Vibes_Virtues_5a68e30c-61ff-4012-8e45-ca9ced637884.svg?v=1744351366"
            alt="Vibes & Virtues"
            className="h-10 md:h-12 w-auto relative z-50"
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="https://vibesandvirtues.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              Shop
            </a>
            
            <div className="relative group">
              <button 
                className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors flex items-center gap-1 py-2"
              >
                Wildcard
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-[220px] overflow-hidden">
                  {wildcardItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black font-medium transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onLoginRequest}
              className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 active:scale-95 transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden relative z-50 p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Navigation Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-full left-[-1rem] right-[-1rem] bg-black border-b border-white/10 md:hidden overflow-hidden"
              >
                <div className="px-6 py-8 space-y-6">
                  <a
                    href="https://vibesandvirtues.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-lg font-semibold text-white/70 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop
                  </a>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsWildcardOpen(!isWildcardOpen)}
                      className="flex items-center justify-between w-full text-lg font-semibold text-white/70 hover:text-white"
                    >
                      Wildcard
                      <ChevronDown className={`w-5 h-5 transition-transform ${isWildcardOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isWildcardOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 space-y-3 overflow-hidden border-l border-white/10"
                        >
                          {wildcardItems.map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-base text-white/50 hover:text-white py-1"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.label}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => {
                      onLoginRequest?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-white text-black text-sm font-bold rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorer';
  const fullEmail = user?.email || (user?.id?.startsWith('dev_') ? atob(user.id.replace('dev_', '')) : 'Guest Session');

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 px-2 md:px-8 py-3 ${
        variant === 'theme'
          ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg'
          : 'bg-[#0A0A0B]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center relative gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <img
            src="https://vibesandvirtues.com/cdn/shop/files/Vibes_Virtues_5a68e30c-61ff-4012-8e45-ca9ced637884.svg?v=1744351366"
            alt="Wildcard"
            className="h-8 md:h-10 w-auto hidden sm:block"
          />
          {/* Profile Info */}
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-white/10 rounded-full border border-white/20 min-w-0">
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/20 flex items-center justify-center">
            <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-semibold text-white leading-tight truncate max-w-[80px] sm:max-w-[150px] md:max-w-none">
              {displayName}
            </span>
            <span className="text-[10px] text-white/70 leading-tight hidden md:block">
              {fullEmail}
            </span>
          </div>
        </div>

        {/* Unlocked Theme Title (Short) */}
        {themeTitle && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
            <Puzzle className="w-4 h-4 text-white/90" />
            <span className="text-xs font-semibold text-white">{themeTitle}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Tokens Badge & Redeem Button */}
        {typeof tokens === 'number' && (
          <div className="flex items-center gap-1.5 md:gap-2 mr-1 md:mr-2">
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 drop-shadow-sm" />
              <span className="text-xs font-bold text-white">
                {tokens} <span className="opacity-70 font-medium ml-0.5 hidden sm:inline">TOKENS</span>
              </span>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowRedeemModal(true)}
              className="h-8 md:h-10 px-3 md:px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full transition-all text-[10px] md:text-sm"
            >
              Redeem
            </Button>
            <RedeemTokensModal
              isOpen={showRedeemModal}
              onClose={() => setShowRedeemModal(false)}
              tokens={tokens}
              expiresAt={themeData?.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()}
              unlockedRewards={themeData?.unlockedRewards || []}
              redeemedRewards={themeData?.redeemedRewards || []}
              userId={user?.id}
              themeId={themeData?.themeId}
            />
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout}
          className="h-8 md:h-10 px-3 md:px-4 text-white/80 hover:text-white hover:bg-white/20 gap-1.5 md:gap-2 rounded-full transition-all border border-white/10 hover:border-white/30"
        >
          <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/90" />
          <span className="text-xs font-medium hidden md:inline">Logout</span>
        </Button>
      </div>
    </div>
    </motion.header>
  );
}
