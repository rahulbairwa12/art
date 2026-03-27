import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, GraduationCap, Puzzle, Leaf, Heart, Crown, Trash2, Globe, Shield, ArrowLeft, Flag, Vote, Users, Sunrise, Music } from 'lucide-react';
import { EnhancedReflection } from './EnhancedReflection';
import { AnimatedTokenProgress } from './AnimatedTokenProgress';
import { RewardUnlockModal } from './RewardUnlockModal';
import { CouponCodeModal } from './CouponCodeModal';
import { FollowUpReflectionModal } from './FollowUpReflectionModal';
import { StickyTabNavigation } from './StickyTabNavigation';
import { OverviewCarousel } from './OverviewCarousel';
import { ArchiveCarousel } from './ArchiveCarousel';
import { ReflectionRewardsCollapsible } from './ReflectionRewardsCollapsible';
import { BonusReflectionTimer } from './BonusReflectionTimer';
import { CooldownBanner } from './CooldownBanner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';

// Theme aesthetic configurations
const THEME_AESTHETICS: Record<string, {
  icon: typeof GraduationCap;
  gradients: string[];
  accentColors: string[];
  dialogTitle: string;
  badgeEmoji: string;
  badgeBg: string;
  archiveName: string;
  reflectionCallToAction: string;
  progressReportName: string;
  archiveSectionName: string;
}> = {
  'classact': {
    icon: GraduationCap,
    gradients: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
      'linear-gradient(135deg, #f093fb 0%, #667eea 25%, #764ba2 50%, #4facfe 75%, #f093fb 100%)',
      'linear-gradient(135deg, #4facfe 0%, #f093fb 25%, #667eea 50%, #764ba2 75%, #4facfe 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
    ],
    accentColors: ['#F59E0B', '#EC4899', '#8B5CF6', '#10B981'],
    dialogTitle: 'The Full Story',
    badgeEmoji: 'A+',
    badgeBg: 'bg-red-500',
    archiveName: '📚 Education Critique Archive',
    reflectionCallToAction: '✏️ Your Turn to Speak Up',
    progressReportName: 'Your Grade Report',
    archiveSectionName: '📌 The Classroom Bulletin Board'
  },
  'newbeginnings': {
    icon: Leaf,
    gradients: [
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #d4fc79 50%, #96e6a1 75%, #a8edea 100%)',
      'linear-gradient(135deg, #fed6e3 0%, #d4fc79 25%, #96e6a1 50%, #a8edea 75%, #fed6e3 100%)',
      'linear-gradient(135deg, #d4fc79 0%, #96e6a1 25%, #a8edea 50%, #fed6e3 75%, #d4fc79 100%)',
      'linear-gradient(135deg, #96e6a1 0%, #a8edea 25%, #fed6e3 50%, #d4fc79 75%, #96e6a1 100%)',
    ],
    accentColors: ['#7DD3C0', '#F8BBD0', '#AED581', '#81D4FA'],
    dialogTitle: 'Renewal Reflection',
    badgeEmoji: '🌱',
    badgeBg: 'bg-pink-400',
    archiveName: '🌱 Renewal Archive',
    reflectionCallToAction: '🌱 Plant Your Seeds of Reflection',
    progressReportName: 'Your Growth Journey',
    archiveSectionName: '🌿 The Garden of Shared Stories'
  },
  'rootsoflove': {
    icon: Heart,
    gradients: [
      'linear-gradient(135deg, #DC143C 0%, #DAA520 25%, #8B4513 50%, #800020 75%, #DC143C 100%)',
      'linear-gradient(135deg, #DAA520 0%, #8B4513 25%, #800020 50%, #DC143C 75%, #DAA520 100%)',
      'linear-gradient(135deg, #8B4513 0%, #800020 25%, #DC143C 50%, #DAA520 75%, #8B4513 100%)',
      'linear-gradient(135deg, #800020 0%, #DC143C 25%, #DAA520 50%, #8B4513 75%, #800020 100%)',
    ],
    accentColors: ['#DC143C', '#DAA520', '#8B4513', '#800020'],
    dialogTitle: 'Legacy & Love',
    badgeEmoji: '❤️',
    badgeBg: 'bg-red-600',
    archiveName: '💝 Legacy Archive',
    reflectionCallToAction: '🌳 Share Your Roots',
    progressReportName: 'Your Legacy Journey',
    archiveSectionName: '💝 The Family Tree of Stories'
  },
  'shereigns': {
    icon: Crown,
    gradients: [
      'linear-gradient(135deg, #8B008B 0%, #DAA520 25%, #C71585 50%, #E6E6FA 75%, #8B008B 100%)',
      'linear-gradient(135deg, #DAA520 0%, #C71585 25%, #E6E6FA 50%, #8B008B 75%, #DAA520 100%)',
      'linear-gradient(135deg, #C71585 0%, #E6E6FA 25%, #8B008B 50%, #DAA520 75%, #C71585 100%)',
      'linear-gradient(135deg, #E6E6FA 0%, #8B008B 25%, #DAA520 50%, #C71585 75%, #E6E6FA 100%)',
    ],
    accentColors: ['#8B008B', '#DAA520', '#C71585', '#E6E6FA'],
    dialogTitle: 'Royal Wisdom',
    badgeEmoji: '👑',
    badgeBg: 'bg-purple-600',
    archiveName: '👑 Royal Wisdom Archive',
    reflectionCallToAction: '👑 Honor Her Legacy',
    progressReportName: 'Your Royal Treasury',
    archiveSectionName: '👑 The Royal Hall of Wisdom'
  },
  'worldofwaste': {
    icon: Trash2,
    gradients: [
      'linear-gradient(135deg, #475569 0%, #1e293b 25%, #059669 50%, #ea580c 75%, #475569 100%)',
      'linear-gradient(135deg, #1e293b 0%, #059669 25%, #ea580c 50%, #475569 75%, #1e293b 100%)',
      'linear-gradient(135deg, #059669 0%, #ea580c 25%, #475569 50%, #1e293b 75%, #059669 100%)',
      'linear-gradient(135deg, #ea580c 0%, #475569 25%, #1e293b 50%, #059669 75%, #ea580c 100%)',
    ],
    accentColors: ['#475569', '#059669', '#ea580c', '#1e293b'],
    dialogTitle: 'Environmental Impact',
    badgeEmoji: '♻️',
    badgeBg: 'bg-slate-600',
    archiveName: '♻️ Environmental Impact Archive',
    reflectionCallToAction: '🌍 Share Your Impact Story',
    progressReportName: 'Your Sustainability Journey',
    archiveSectionName: '🌎 The Global Reflection Wall'
  },
  'echoesoftheeast': {
    icon: Globe,
    gradients: [
      'linear-gradient(135deg, #1C2A5A 0%, #B22234 25%, #D4AF37 50%, #F5E6C8 75%, #1C2A5A 100%)',
      'linear-gradient(135deg, #B22234 0%, #D4AF37 25%, #F5E6C8 50%, #1C2A5A 75%, #B22234 100%)',
      'linear-gradient(135deg, #D4AF37 0%, #F5E6C8 25%, #1C2A5A 50%, #B22234 75%, #D4AF37 100%)',
      'linear-gradient(135deg, #F5E6C8 0%, #1C2A5A 25%, #B22234 50%, #D4AF37 75%, #F5E6C8 100%)',
    ],
    accentColors: ['#1C2A5A', '#B22234', '#D4AF37', '#F5E6C8'],
    dialogTitle: 'Cultural Exchange',
    badgeEmoji: '🌏',
    badgeBg: 'bg-indigo-900',
    archiveName: '🌏 Cultural Dialogue Archive',
    reflectionCallToAction: '🌏 Share Your Cultural Story',
    progressReportName: 'Your Cultural Journey',
    archiveSectionName: '🎎 The Bridge of Shared Stories'
  },
  'fathersofchange': {
    icon: Shield,
    gradients: [
      'linear-gradient(135deg, #C1121F 0%, #1C2D4A 20%, #D4AF37 40%, #1C2D4A 60%, #C1121F 80%, #6B4F3A 100%)',
      'linear-gradient(135deg, #D4AF37 0%, #C1121F 20%, #1C2D4A 40%, #6B4F3A 60%, #D4AF37 80%, #C1121F 100%)',
      'linear-gradient(135deg, #1C2D4A 0%, #6B4F3A 20%, #C1121F 40%, #D4AF37 60%, #1C2D4A 80%, #C1121F 100%)',
      'linear-gradient(135deg, #6B4F3A 0%, #D4AF37 20%, #C1121F 40%, #1C2D4A 60%, #D4AF37 80%, #6B4F3A 100%)',
    ],
    accentColors: ['#C1121F', '#1C2D4A', '#D4AF37', '#6B4F3A'],
    dialogTitle: 'Legacy of Liberation',
    badgeEmoji: '🛡️',
    badgeBg: 'bg-red-700',
    archiveName: '🛡️ Fathers of Change Archive',
    reflectionCallToAction: '🛡️ Honor the Legacy',
    progressReportName: 'Your Legacy Treasury',
    archiveSectionName: '🛡️ The Hall of Fatherhood Wisdom'
  },
  'unapologeticallyproud': {
    icon: Flag,
    gradients: [
      'linear-gradient(135deg, #E63946 0%, #F77F00 20%, #F9C74F 40%, #2A9D8F 60%, #4361EE 80%, #9D4EDD 100%)',
      'linear-gradient(135deg, #F77F00 0%, #F9C74F 20%, #2A9D8F 40%, #4361EE 60%, #9D4EDD 80%, #E63946 100%)',
      'linear-gradient(135deg, #F9C74F 0%, #2A9D8F 20%, #4361EE 40%, #9D4EDD 60%, #E63946 80%, #F77F00 100%)',
      'linear-gradient(135deg, #2A9D8F 0%, #4361EE 20%, #9D4EDD 40%, #E63946 60%, #F77F00 80%, #F9C74F 100%)',
    ],
    accentColors: ['#E63946', '#F77F00', '#2A9D8F', '#4361EE', '#9D4EDD', '#F9C74F'],
    dialogTitle: 'Living Authentically',
    badgeEmoji: '🏳️‍🌈',
    badgeBg: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500',
    archiveName: '🏳️‍🌈 The Pride Archive',
    reflectionCallToAction: '💫 Share Your Truth',
    progressReportName: 'Your Pride Journey',
    archiveSectionName: '🏳️‍🌈 The Pride Wall'
  },
  'patriotparadox': {
    icon: Flag,
    gradients: [
      'linear-gradient(135deg, #1C2D4A 0%, #B22234 25%, #6C757D 50%, #F5F5F5 75%, #1C2D4A 100%)',
      'linear-gradient(135deg, #B22234 0%, #6C757D 25%, #F5F5F5 50%, #1C2D4A 75%, #B22234 100%)',
      'linear-gradient(135deg, #6C757D 0%, #F5F5F5 25%, #1C2D4A 50%, #B22234 75%, #6C757D 100%)',
      'linear-gradient(135deg, #F5F5F5 0%, #1C2D4A 25%, #B22234 50%, #6C757D 75%, #F5F5F5 100%)',
    ],
    accentColors: ['#1C2D4A', '#B22234', '#F5F5F5', '#6C757D'],
    dialogTitle: 'Critical Patriotism',
    badgeEmoji: '🇺🇸',
    badgeBg: 'bg-gradient-to-r from-blue-900 via-red-600 to-gray-200',
    archiveName: '🇺🇸 Patriot Paradox Archive',
    reflectionCallToAction: '🗽 Question the Narrative',
    progressReportName: 'Your Civic Reflection',
    archiveSectionName: '🗽 The Hall of Critical Voices'
  },
  'fallforward': {
    icon: Leaf,
    gradients: [
      'linear-gradient(135deg, #C75B12 0%, #E6A23C 25%, #B33A3A 50%, #5A3E2B 75%, #C75B12 100%)',
      'linear-gradient(135deg, #E6A23C 0%, #B33A3A 25%, #5A3E2B 50%, #C75B12 75%, #E6A23C 100%)',
      'linear-gradient(135deg, #B33A3A 0%, #5A3E2B 25%, #C75B12 50%, #E6A23C 75%, #B33A3A 100%)',
      'linear-gradient(135deg, #5A3E2B 0%, #C75B12 25%, #E6A23C 50%, #B33A3A 75%, #5A3E2B 100%)',
    ],
    accentColors: ['#C75B12', '#E6A23C', '#5A3E2B', '#B33A3A'],
    dialogTitle: 'Growth Through Setbacks',
    badgeEmoji: '🍂',
    badgeBg: 'bg-gradient-to-r from-orange-600 via-amber-500 to-red-700',
    archiveName: '🍂 Fall Forward Archive',
    reflectionCallToAction: '🍁 Share Your Growth Story',
    progressReportName: 'Your Growth Journey',
    archiveSectionName: '🍂 The Harvest of Transformation'
  },
  'frighttovote': {
    icon: Vote,
    gradients: [
      'linear-gradient(135deg, #F97316 0%, #111111 25%, #6D28D9 50%, #B91C1C 75%, #F97316 100%)',
      'linear-gradient(135deg, #111111 0%, #6D28D9 25%, #B91C1C 50%, #F97316 75%, #111111 100%)',
      'linear-gradient(135deg, #6D28D9 0%, #B91C1C 25%, #F97316 50%, #111111 75%, #6D28D9 100%)',
      'linear-gradient(135deg, #B91C1C 0%, #F97316 25%, #111111 50%, #6D28D9 75%, #B91C1C 100%)',
    ],
    accentColors: ['#F97316', '#111111', '#6D28D9', '#B91C1C'],
    dialogTitle: 'Democracy Without Fear',
    badgeEmoji: '🗳️',
    badgeBg: 'bg-gradient-to-r from-orange-500 via-purple-700 to-red-700',
    archiveName: '🗳️ Fright to Vote Archive',
    reflectionCallToAction: '🗳️ Raise Your Voice',
    progressReportName: 'Your Civic Reflection',
    archiveSectionName: '🗳️ The Voting Booth'
  },
  'gatherround': {
    icon: Users,
    gradients: [
      'linear-gradient(135deg, #C56A2D 0%, #E89A3D 25%, #5C3A21 50%, #F3E5C8 75%, #C56A2D 100%)',
      'linear-gradient(135deg, #E89A3D 0%, #5C3A21 25%, #F3E5C8 50%, #C56A2D 75%, #E89A3D 100%)',
      'linear-gradient(135deg, #5C3A21 0%, #F3E5C8 25%, #C56A2D 50%, #E89A3D 75%, #5C3A21 100%)',
      'linear-gradient(135deg, #F3E5C8 0%, #C56A2D 25%, #E89A3D 50%, #5C3A21 75%, #F3E5C8 100%)',
    ],
    accentColors: ['#C56A2D', '#E89A3D', '#5C3A21', '#F3E5C8'],
    dialogTitle: 'Gratitude & Truth',
    badgeEmoji: '🍽️',
    badgeBg: 'bg-gradient-to-r from-orange-700 via-amber-500 to-orange-900',
    archiveName: '🍽️ Gather Round Archive',
    reflectionCallToAction: '🍽️ Share Your Story',
    progressReportName: 'Your Gathering Journey',
    archiveSectionName: '🍽️ The Table of Stories'
  },
  'under-the-mistletoe': {
    icon: Heart,
    gradients: [
      'linear-gradient(135deg, #C1121F 0%, #1B5E20 25%, #D4AF37 50%, #F5F5F5 75%, #C1121F 100%)',
      'linear-gradient(135deg, #1B5E20 0%, #D4AF37 25%, #F5F5F5 50%, #C1121F 75%, #1B5E20 100%)',
      'linear-gradient(135deg, #D4AF37 0%, #F5F5F5 25%, #C1121F 50%, #1B5E20 75%, #D4AF37 100%)',
      'linear-gradient(135deg, #F5F5F5 0%, #C1121F 25%, #1B5E20 50%, #D4AF37 75%, #F5F5F5 100%)',
    ],
    accentColors: ['#C1121F', '#1B5E20', '#D4AF37', '#F5F5F5'],
    dialogTitle: 'Holiday Love',
    badgeEmoji: '🎄',
    badgeBg: 'bg-gradient-to-r from-red-700 via-green-800 to-yellow-600',
    archiveName: '🎄 Under the Mistletoe Archive',
    reflectionCallToAction: '🎄 Share Your Heart',
    progressReportName: 'Your Holiday Love Journey',
    archiveSectionName: '🎄 Stories of Holiday Love'
  }
};

// Map theme IDs to their music library links
const MUSIC_LIBRARY_LINKS: Record<string, string> = {
  'classact': 'https://mailchi.mp/4dcec8a18f94/24v3yd8j11',
  'newbeginnings': 'https://mailchi.mp/4dcec8a18f94/24v3yd8j11',
  'rootsoflove': 'https://mailchi.mp/92a342d124fd/4ijbyy0pki',
  'shereigns': 'https://mailchi.mp/92936572fa19/6pyjfdt4zq',
  'worldofwaste': 'https://mailchi.mp/31144cb45f69/wvseljiqcy',
  'echoesoftheeast': 'https://mailchi.mp/859c88b7a2d9/tt0c165ekq',
  'fathersofchange': 'https://mailchi.mp/ec5171cf3138/ddg19x4h9i',
  'unapologeticallyproud': 'https://mailchi.mp/4147f1882f30/czxhp59i3u',
  'patriotparadox': 'https://mailchi.mp/5fc68eebf0a6/7cpjn1jabo',
  'fallforward': 'https://mailchi.mp/d7fb6f420be7/xxb7np875c',
  'frighttovote': 'https://mailchi.mp/743d45b3781a/xlpndjstm2',
  'gatherround': 'https://mailchi.mp/ea837bca22b3/8sain1dpnx',
  'under-the-mistletoe': 'https://mailchi.mp/046f7c3f060d/chpixq2fk1',
};

interface Theme {
  title: string;
  youtubeVideoId: string;
  artworkUrl: string;
  currentPrompt: string;
  currentFollowUpQuestions?: {
    'follow-up'?: string;
    deeper?: string;
    'archive-response'?: string;
    perspective?: string;
    'time-shift'?: string;
    archiveResponse?: string;
    conversationReply?: string;
    reflectionChain?: string;
  };
  rewardTiers?: Array<{ tokens: number; discount: number; code: string }>;
  themeDetails?: {
    artistStatement: string;
    yearCreated: string;
    medium: string;
    dimensions: string;
    inspiration: string;
  };
  // Aesthetic overrides
  gradients?: string[];
  accentColors?: string[];
  badgeEmoji?: string;
  badgeBg?: string;
  archiveName?: string;
  reflectionCallToAction?: string;
  progressReportName?: string;
  archiveSectionName?: string;
  archiveSectionHeading?: string;
  archiveSectionCaption?: string;
  overviewIcon?: string;
  overviewSlides?: Array<{
    type: 'image-cta' | 'info' | 'music';
    title?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
    description?: string;
    buttonText?: string;
    icon?: string;
    themeDetails?: {
      artistStatement?: string;
      yearCreated?: string;
      medium?: string;
      dimensions?: string;
      inspiration?: string;
    };
    youtubeVideoId?: string;
    musicLibraryLink?: string;
  }>;
  musicSectionTitle?: string;
  musicYoutubeVideoId?: string;
  musicLibraryLink?: string;
  musicSectionButtonText?: string;
  musicSectionCaption?: string;
}

interface ThemePageProps {
  userId: string;
  themeId: string;
  theme: Theme;
  initialTokens: number;
  expiresAt: string;
  unlockedRewards: number[];
  promptStartDate?: string;
  onBackToPortal?: () => void;
}

interface Reflection {
  content: string;
  timestamp: string;
}

interface ReflectionProgress {
  type: string;
  timestamp: string;
}

// Floating puzzle piece component
const FloatingPuzzlePiece = ({ delay = 0, color = "#F59E0B" }: { delay?: number; color?: string }) => (
  <motion.div
    className="absolute opacity-20 pointer-events-none"
    initial={{ y: -100, x: -50, rotate: 0 }}
    animate={{
      y: [null, 100, 150, 100],
      x: [null, 30, -20, 30],
      rotate: [null, 15, -15, 15],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    <Puzzle className="w-12 h-12 md:w-16 md:h-16" style={{ color }} />
  </motion.div>
);

// Floating grade letter
const FloatingGrade = ({ grade, delay = 0, startX = 0 }: { grade: string; delay?: number; startX?: string | number }) => (
  <motion.div
    className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
    initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: startX, rotate: 0 }}
    animate={{
      y: -200,
      rotate: [0, 360],
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      delay,
      ease: "linear",
    }}
    style={{ fontFamily: 'var(--font-heading)' }}
  >
    {grade}
  </motion.div>
);

// Paper airplane
const PaperAirplane = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute opacity-20 pointer-events-none"
    initial={{ x: -100, y: 100, rotate: 45 }}
    animate={{
      x: typeof window !== 'undefined' ? window.innerWidth + 100 : 800,
      y: [null, 80, 120, 80],
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="md:w-10 md:h-10">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  </motion.div>
);

// Gold star
const GoldStar = ({ delay = 0, startX = 0, startY = 0 }: { delay?: number; startX?: string | number; startY?: number }) => (
  <motion.div
    className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
    initial={{ x: startX, y: startY, scale: 0, rotate: 0 }}
    animate={{
      y: [null, startY - 30, startY],
      scale: [0, 1, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    ⭐
  </motion.div>
);

// Chalk dust particles
const ChalkDust = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-white rounded-full opacity-30"
        initial={{
          x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 600,
          y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 800,
        }}
        animate={{
          y: [null, typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 800],
          x: [null, typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 600],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Chalkboard line decoration
const ChalkboardLines = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="w-full border-t border-white"
        style={{ marginTop: '2rem' }}
      />
    ))}
  </div>
);

// Helper function to get the continue section heading based on theme
const getContinueHeading = (themeId: string, customHeading?: string): string => {
  if (customHeading) return customHeading;

  const headings: Record<string, string> = {
    'patriotparadox': '🗽 Continue the Conversation',
    'newbeginnings': '🌸 Continue Your Journey',
    'rootsoflove': '🌺 Honor the Legacy',
    'shereigns': '💎 Royal Offerings',
    'worldofwaste': '🌍 Sustain the Movement',
    'echoesoftheeast': '🌏 Explore Cultural Connections',
    'fathersofchange': '🛡️ Sustain Freedom',
    'unapologeticallyproud': '🏳️‍🌈 Celebrate Authenticity',
    'fallforward': '🍂 Keep Growing Forward',
    'frighttovote': '🎃 Keep Democracy Alive',
    'gatherround': '🍽️ Keep the Conversation Going',
    'under-the-mistletoe': '🎄 Keep Spreading the Love',
  };
  return headings[themeId] || '📚 Extra Credit Options';
};

export function ThemePage({ userId, themeId, theme, initialTokens, expiresAt, unlockedRewards, promptStartDate, onBackToPortal }: ThemePageProps) {
  const [tokens, setTokens] = useState(initialTokens);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(expiresAt);
  const [currentUnlockedRewards, setCurrentUnlockedRewards] = useState<number[]>(unlockedRewards);
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([]);
  const [archiveReflections, setArchiveReflections] = useState<Reflection[]>([]);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newlyUnlockedReward, setNewlyUnlockedReward] = useState<number | null>(null);

  // Coupon code modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<{ discount: number; code: string; tokensRedeemed: number } | null>(null);

  // Follow-up reflection modal state
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpWindowEnd, setFollowUpWindowEnd] = useState<number | null>(null);
  const [isInFollowUpWindow, setIsInFollowUpWindow] = useState(false);
  const [hasSubmittedMainReflection, setHasSubmittedMainReflection] = useState(false);
  const [pendingFollowUpModal, setPendingFollowUpModal] = useState(false);
  const [submittedPrimaryReflection, setSubmittedPrimaryReflection] = useState<string>('');

  // Reflection progress tracking
  const [completedReflections, setCompletedReflections] = useState<string[]>([]);
  const [randomArchiveReflection, setRandomArchiveReflection] = useState<Reflection | null>(null);

  // Cooldown state
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [nextAvailableDate, setNextAvailableDate] = useState<string | null>(null);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('overview');

  // Music library state
  const [hasAddedToLibrary, setHasAddedToLibrary] = useState(false);

  // Refs for scrolling
  const overviewRef = useRef<HTMLDivElement>(null);
  const musicRef = useRef<HTMLDivElement>(null);
  const reflectRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);

  // Use reward tiers from theme (with fallback to default)
  const REWARD_TIERS = theme.rewardTiers || [
    { tokens: 100, discount: 10, code: 'VIBE10' },
    { tokens: 250, discount: 20, code: 'VIBE20' },
    { tokens: 500, discount: 30, code: 'VIBE30' },
    { tokens: 750, discount: 40, code: 'VIBE40' },
    { tokens: 1000, discount: 50, code: 'VIBE50' },
  ];

  // Helper to map icon names to components
  const getIconComponent = (iconName?: string) => {
    const icons: Record<string, any> = {
      GraduationCap, Sunrise, Heart, Crown, Trash2, Globe, Shield, Flag, Leaf, Vote, Users, Music, Puzzle
    };
    return icons[iconName || ''] || icons['GraduationCap'];
  };

  // Get theme aesthetics with dynamic overrides
  const baseAesthetic = THEME_AESTHETICS[themeId] || THEME_AESTHETICS['classact'];
  const themeAesthetic = {
    ...baseAesthetic,
    gradients: theme.gradients && theme.gradients.length > 0 ? theme.gradients : baseAesthetic.gradients,
    accentColors: theme.accentColors && theme.accentColors.length > 0 ? theme.accentColors : baseAesthetic.accentColors,
    badgeEmoji: theme.badgeEmoji || baseAesthetic.badgeEmoji,
    badgeBg: theme.badgeBg || baseAesthetic.badgeBg,
    archiveName: theme.archiveName || baseAesthetic.archiveName,
    reflectionCallToAction: theme.reflectionCallToAction || baseAesthetic.reflectionCallToAction,
    progressReportName: theme.progressReportName || baseAesthetic.progressReportName,
    archiveSectionName: theme.archiveSectionName || baseAesthetic.archiveSectionName,
    icon: theme.overviewIcon ? getIconComponent(theme.overviewIcon) : baseAesthetic.icon
  };
  const ThemeIcon = themeAesthetic.icon;

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    const now = new Date();
    const expires = new Date(tokenExpiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  useEffect(() => {
    loadArchiveReflections();
    if (userId && userId !== 'undefined') {
      loadUserProgress();
      checkCooldownStatus();
    }
  }, [themeId, userId]);

  const checkCooldownStatus = async () => {
    try {
      const response = await fetch(`/api/check-cooldown/${userId}/${themeId}`);

      if (response.ok) {
        const data = await response.json();
        setIsOnCooldown(data.isOnCooldown);
        setNextAvailableDate(data.nextAvailableDate);
      }
    } catch (error) {
      console.error('Error checking cooldown status:', error);
    }
  };
  
  // ScrollSpy logic
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // If we are currently scrolling from a manual tab click, ignore observer updates
      if (isManualScrolling.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    const sectionIds = ['overview', 'music', 'reflect', 'rewards', 'archive'];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isOnCooldown, nextAvailableDate, isInFollowUpWindow]);

  const loadArchiveReflections = async () => {
    try {
      const response = await fetch(`/api/archive/${themeId}`);

      if (response.ok) {
        const data = await response.json();
        const reflections = data.reflections || [];
        setArchiveReflections(reflections);

        // Pick a random reflection for the archive response feature
        if (reflections.length > 0) {
          const randomIndex = Math.floor(Math.random() * reflections.length);
          setRandomArchiveReflection(reflections[randomIndex]);
        }
      }
    } catch (error) {
      console.error('Error loading archive reflections:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const response = await fetch(`/api/user-progress/${userId}/${themeId}`);

      if (response.ok) {
        const data = await response.json();
        const reflectionTypes = (data.reflections || []).map((r: ReflectionProgress) => r.type);
        setCompletedReflections(reflectionTypes);

        // Check if user has added this song to library
        setHasAddedToLibrary(data.hasAddedToLibrary || false);

        // Load redeemed rewards
        setRedeemedRewards(data.redeemedRewards || []);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const getDaysUntilNextPrompt = () => {
    if (!promptStartDate) return 14; // Default to 14 days if no start date

    const startDate = new Date(promptStartDate).getTime();
    const now = Date.now();
    const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
    const nextPeriodStart = startDate + ((currentPeriodIndex + 1) * 14 * 24 * 60 * 60 * 1000);
    const daysUntilNext = Math.ceil((nextPeriodStart - now) / (24 * 60 * 60 * 1000));

    return daysUntilNext;
  };

  const getNextPromptDate = () => {
    if (!promptStartDate) return null;

    const startDate = new Date(promptStartDate).getTime();
    const now = Date.now();
    const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
    const nextPeriodStart = startDate + ((currentPeriodIndex + 1) * 14 * 24 * 60 * 60 * 1000);

    return new Date(nextPeriodStart).toISOString();
  };

  const handleRedeemCode = async (rewardTier: number) => {
    try {
      const response = await fetch('/api/redeem-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          themeId,
          rewardTier,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRedeemedRewards([...redeemedRewards, rewardTier]);

        // Update tokens to reflect deduction
        if (data.remainingTokens !== undefined) {
          setTokens(data.remainingTokens);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to mark reward as redeemed:', errorData.error);
        toast.error('Failed to redeem reward', {
          description: errorData.error || 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error redeeming reward code:', error);
      toast.error('Network error', {
        description: 'Unable to redeem reward. Please check your connection.',
      });
    }
  };

  const handleAddToLibrary = async () => {
    try {
      const response = await fetch('/api/add-to-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          themeId,
          youtubeVideoId: theme.youtubeVideoId,
          title: theme.title,
        }),
      });

      if (response.ok) {
        setHasAddedToLibrary(true);
        toast.success('🎵 Song added to your library!');
      } else {
        toast.error('Failed to add song to library');
      }
    } catch (error) {
      console.error('Error adding to library:', error);
      toast.error('Failed to add song to library');
    }
  };

  const handleReflectionSubmit = async (content: string, reflectionType: string) => {
    try {
      const response = await fetch('/api/submit-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          themeId,
          content,
          promptId: 'default',
          reflectionType,
        }),
      });

      if (response.status === 400) {
        // Quality validation or AI verification failed
        const errorData = await response.json();
        if (errorData.isQualityIssue || errorData.isAIQualityIssue) {
          toast.error(errorData.error, { duration: 6000 });
          return;
        }
      }

      if (response.status === 429) {
        // User is on cooldown
        const errorData = await response.json();
        if (errorData.isOnCooldown) {
          setIsOnCooldown(true);
          setNextAvailableDate(errorData.nextAvailableDate);

          const nextDate = new Date(errorData.nextAvailableDate);
          const now = new Date();
          const daysRemaining = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const formattedDate = nextDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          toast.error(
            <div className="space-y-2">
              <p className="font-bold">You've already submitted a reflection for this two-week period!</p>
              <p className="text-2xl font-black">⏳ {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} until new prompt</p>
              <p className="text-sm">Next available: <strong>{formattedDate}</strong></p>
              <p>Want to earn more Vibe Tokens now? Join our Discord community!</p>
              <a
                href="https://discord.gg/CZt2YWrpVz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline block"
              >
                Visit Vibes & Virtues Discord →
              </a>
            </div>,
            { duration: 8000 }
          );
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        setTokens(data.totalTokens);
        setTokensEarned(data.tokensEarned);
        setShowSuccess(true);

        // Update expiration date
        if (data.expiresAt) {
          setTokenExpiresAt(data.expiresAt);
        }

        // If this is a main reflection, user is now on cooldown
        if (reflectionType === 'main') {
          setIsOnCooldown(true);
          if (data.nextAvailableDate) {
            setNextAvailableDate(data.nextAvailableDate);
          }
        }

        // Handle follow-up reflection window for main reflections
        if (reflectionType === 'main') {
          setHasSubmittedMainReflection(true);
          setSubmittedPrimaryReflection(content); // Save the primary reflection content

          // Check for newly unlocked rewards
          if (data.newlyUnlockedRewards && data.newlyUnlockedRewards.length > 0) {
            setCurrentUnlockedRewards([...currentUnlockedRewards, ...data.newlyUnlockedRewards]);
            // Show modal for the highest newly unlocked reward
            const highestReward = Math.max(...data.newlyUnlockedRewards);
            setNewlyUnlockedReward(highestReward);

            // Mark that we need to show follow-up modal after reward flow completes
            setPendingFollowUpModal(true);

            // Show reward modal after success animation
            setTimeout(() => {
              setShowRewardModal(true);
            }, 2500);
          } else {
            // No reward unlocked, show follow-up modal directly
            setTimeout(() => {
              setShowFollowUpModal(true);
            }, 2000);
          }
        } else {
          // Follow-up reflection submitted - check if still in window
          if (!isInFollowUpWindow) {
            toast.error('Follow-up window has expired. Submit a new main reflection to unlock another bonus window.');
            return;
          }
        }

        // Add to completed reflections
        setCompletedReflections([...completedReflections, reflectionType]);

        // Reload archive
        setTimeout(() => {
          loadArchiveReflections();
          setShowSuccess(false);
        }, 2000);
      } else {
        console.error('Failed to submit reflection');
      }
    } catch (error) {
      console.error('Error submitting reflection:', error);
    }
  };

  const handleRewardRedeem = async () => {
    if (!newlyUnlockedReward) return;

    const rewardTier = REWARD_TIERS.find(tier => tier.tokens === newlyUnlockedReward);
    if (!rewardTier) return;

    try {
      const deductResponse = await fetch('/api/redeem-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          themeId,
          rewardTier: rewardTier.tokens,
        }),
      });

      if (deductResponse.ok) {
        const deductData = await deductResponse.json();
        setTokens(deductData.remainingTokens);

        // Show coupon code modal
        setCurrentCoupon({
          discount: rewardTier.discount,
          code: rewardTier.code,
          tokensRedeemed: rewardTier.tokens,
        });
        setShowCouponModal(true);
      } else {
        toast.error('Failed to redeem reward. Please try again.');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Error redeeming reward. Please try again.');
    }
  };

  const handleRewardModalClose = () => {
    // Called when reward modal closes (either by redeeming or keeping tokens)
    setShowRewardModal(false);

    // If they chose to keep earning and we have a pending follow-up modal, show it
    if (pendingFollowUpModal && !showCouponModal) {
      setPendingFollowUpModal(false);
      setTimeout(() => {
        setShowFollowUpModal(true);
      }, 300);
    }
  };

  const handleCouponModalClose = () => {
    // Called when coupon modal closes after redeeming
    setShowCouponModal(false);
    setCurrentCoupon(null);

    // Now show the follow-up modal if it's pending
    if (pendingFollowUpModal) {
      setPendingFollowUpModal(false);
      setTimeout(() => {
        setShowFollowUpModal(true);
      }, 300);
    }
  };

  const handleStartTimer = () => {
    // Start 2-minute window when user clicks "I understand"
    const endTime = Date.now() + (2 * 60 * 1000); // 2 minutes from now
    setFollowUpWindowEnd(endTime);
    setIsInFollowUpWindow(true);

    // Set timer to end the window
    setTimeout(() => {
      setIsInFollowUpWindow(false);
      setHasSubmittedMainReflection(false);
    }, 2 * 60 * 1000);

    // Scroll to the reflection section
    if (reflectRef?.current) {
      const offset = 180; // Account for sticky nav + timer
      const elementPosition = reflectRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleTimerEnd = () => {
    setIsInFollowUpWindow(false);
    setHasSubmittedMainReflection(false);
    setFollowUpWindowEnd(null);
    setSubmittedPrimaryReflection(''); // Clear saved reflection when timer ends
    toast.info('Bonus reflection window has closed. Submit a new main reflection to unlock another bonus window.');
  };

  const handleTabChange = (tab: string) => {
    console.log('Tab clicked:', tab);
    setActiveTab(tab);

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // Scroll to the appropriate section
      const refs = {
        overview: overviewRef,
        music: musicRef,
        reflect: reflectRef,
        rewards: rewardsRef,
        archive: archiveRef,
      };

      const targetRef = refs[tab as keyof typeof refs];

      if (targetRef?.current) {
        // Calculate exact scroll position taking into account all fixed/sticky elements
        const elementPosition = targetRef.current.getBoundingClientRect().top;
        const startPosition = window.pageYOffset;

        // Header (64px) + Sticky Nav (~60px) + Padding
        let offset = 64 + 60 + 20;

        // Cooldown Banner (~64px)
        const hasCooldownBanner = isOnCooldown && !!nextAvailableDate;
        if (hasCooldownBanner) offset += 64;

        // Follow Up Modal Window
        if (isInFollowUpWindow) offset += 80;

        window.scrollTo({
          top: startPosition + elementPosition - offset,
          behavior: 'smooth'
        });

        // Block observer updates for a short duration while we scroll
        isManualScrolling.current = true;
        setTimeout(() => {
          isManualScrolling.current = false;
        }, 1200);
      } else {
        console.log('No ref found for tab:', tab);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen relative overflow-x-clip md:overflow-x-visible">


      {/* Cooldown Banner */}
      {isOnCooldown && nextAvailableDate && (
        <CooldownBanner nextAvailableDate={nextAvailableDate} />
      )}

      {/* Bonus Reflection Timer */}
      {followUpWindowEnd && isInFollowUpWindow && (
        <BonusReflectionTimer
          endTime={followUpWindowEnd}
          onTimeEnd={handleTimerEnd}
          hasCooldownBanner={isOnCooldown && !!nextAvailableDate}
        />
      )}

      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: themeAesthetic.gradients || [
            'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
            'linear-gradient(135deg, #f093fb 0%, #667eea 25%, #764ba2 50%, #4facfe 75%, #f093fb 100%)',
            'linear-gradient(135deg, #4facfe 0%, #f093fb 25%, #667eea 50%, #764ba2 75%, #4facfe 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Container for background and floating elements that should be clipped to prevent horizontal overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        {/* Chalkboard texture overlay */}
        <ChalkboardLines />

      {/* Chalk dust particles */}
      <ChalkDust />

      {/* Theme-specific floating elements */}
      {themeId === 'newbeginnings' ? (
        <>
          {/* Floating sprouts, butterflies, and leaves for New Beginnings */}
          <motion.div
            className="absolute opacity-25 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🌱
          </motion.div>
          <motion.div
            className="absolute opacity-25 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🦋
          </motion.div>
          <motion.div
            className="absolute opacity-25 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 90, 140, 90],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🍃
          </motion.div>
          <motion.div
            className="absolute opacity-25 pointer-events-none text-5xl"
            initial={{ y: -100, x: "90%", rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: ["95%", "90%", "85%", "90%"],
              rotate: [null, 25, -25, 25],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🌸
          </motion.div>
          {/* Gold stars for New Beginnings */}
          <GoldStar delay={0} startX={150} startY={200} />
          <GoldStar delay={2} startX={450} startY={400} />
          <GoldStar delay={4} startX={250} startY={600} />
          <GoldStar delay={6} startX={550} startY={300} />
        </>
      ) : themeId === 'rootsoflove' ? (
        <>
          {/* Floating hearts, roses, and family symbols for Roots of Love */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 50, rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: [null, 80, 30, 80],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            ❤️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 200, rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: [null, 230, 180, 230],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🌹
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 90, 140, 90],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            💝
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "90%", rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: ["95%", "90%", "85%", "90%"],
              rotate: [null, 25, -25, 25],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🌺
          </motion.div>
          {/* Floating family and tree symbols */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
          >
            👨‍👩‍👧‍👦
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
          >
            🌳
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "80%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
          >
            💕
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "35%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
          >
            🏠
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "65%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
          >
            👵👴
          </motion.div>
          {/* Hearts as "stars" for Roots of Love */}
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "25%", y: 200, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 200 - 30, 200],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            💖
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "75%", y: 400, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 400 - 30, 400],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            ❤️
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "45%", y: 600, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 600 - 30, 600],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            💝
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "95%", y: 300, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 300 - 30, 300],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            💕
          </motion.div>
        </>
      ) : themeId === 'shereigns' ? (
        <>
          {/* Floating crowns and royal symbols for She Reigns */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            👑
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            💜
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 90, 140, 90],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "90%", rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: ["95%", "90%", "85%", "90%"],
              rotate: [null, 25, -25, 25],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            👑
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
          >
            ♛
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
          >
            💎
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "80%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
          >
            👸
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "35%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "65%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
          >
            🌟
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "25%", y: 200, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 200 - 30, 200],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            👑
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "75%", y: 400, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 400 - 30, 400],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "45%", y: 600, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 600 - 30, 600],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            💜
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "95%", y: 300, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 300 - 30, 300],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            👑
          </motion.div>
        </>
      ) : themeId === 'worldofwaste' ? (
        <>
          {/* Floating trash, recycling symbols for World of Waste */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 50, rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: [null, 80, 30, 80],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            ♻️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 200, rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: [null, 230, 180, 230],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🗑️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 350, rotate: 0 }}
            animate={{
              y: [null, 90, 140, 90],
              x: [null, 380, 330, 380],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🌍
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 500, rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: [null, 530, 480, 530],
              rotate: [null, 25, -25, 25],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🧃
          </motion.div>
          {/* Floating environmental symbols rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 100, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
          >
            🗑️
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 300, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
          >
            ♻️
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "80%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
          >
            🥤
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "35%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
          >
            🌱
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "65%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
          >
            🧴
          </motion.div>
          {/* Pulsing environmental symbols */}
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "25%", y: 200, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 200 - 30, 200],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            ♻️
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "75%", y: 400, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 400 - 30, 400],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🌍
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "45%", y: 600, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 600 - 30, 600],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🗑️
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "95%", y: 300, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 300 - 30, 300],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            ♻️
          </motion.div>
        </>
      ) : themeId === 'echoesoftheeast' ? (
        <>
          {/* Floating cultural symbols for Echoes of the East */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🎋
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🌏
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 90, 140, 90],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🎎
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "90%", rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: ["95%", "90%", "85%", "90%"],
              rotate: [null, 25, -25, 25],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🪷
          </motion.div>
          {/* Floating music and cultural symbols rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 100, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
          >
            🎶
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 300, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
          >
            🥁
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 500, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
          >
            🌅
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 200, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
          >
            🎎
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 400, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
          >
            ✨
          </motion.div>
          {/* Pulsing cultural symbols */}
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: 150, y: 200, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 200 - 30, 200],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🪷
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: 450, y: 400, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 400 - 30, 400],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🌏
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: 250, y: 600, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 600 - 30, 600],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🎋
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "95%", y: 300, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 300 - 30, 300],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🎶
          </motion.div>
        </>
      ) : themeId === 'fathersofchange' ? (
        <>
          {/* Floating Juneteenth and fatherhood symbols for Fathers of Change */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🛡️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 90, 140, 90],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🛡️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "90%", rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: ["95%", "90%", "85%", "90%"],
              rotate: [null, 25, -25, 25],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🛡️
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
          >
            ✊🏿
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
          >
            👔
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "80%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
          >
            📚
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "35%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
          >
            🏛️
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "65%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
          >
            👨‍👧‍👦
          </motion.div>
          {/* Pulsing Juneteenth symbols */}
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "25%", y: 200, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 200 - 30, 200],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🎊
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "75%", y: 400, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 400 - 30, 400],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🔥
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "45%", y: 600, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 600 - 30, 600],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            💪🏿
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "95%", y: 300, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 300 - 30, 300],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 6,
              ease: "easeInOut",
            }}
          >
            🎵
          </motion.div>
        </>
      ) : themeId === 'unapologeticallyproud' ? (
        <>
          {/* Floating pride symbols for Unapologetically Proud */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 60, rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: [null, 90, 40, 90],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🏳️‍🌈
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 450, rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: [null, 480, 430, 480],
              rotate: [null, -10, 10, -10],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🌈
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 150, rotate: 0 }}
            animate={{
              y: [null, 140, 190, 140],
              x: [null, 180, 130, 180],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut",
            }}
          >
            💜
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 550, rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: [null, 580, 530, 580],
              rotate: [null, 12, -12, 12],
            }}
            transition={{
              duration: 7.8,
              repeat: Infinity,
              delay: 3,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 320, rotate: 0 }}
            animate={{
              y: [null, 130, 180, 130],
              x: [null, 350, 300, 350],
              rotate: [null, 8, -8, 8],
            }}
            transition={{
              duration: 8.2,
              repeat: Infinity,
              delay: 1.5,
              ease: "easeInOut",
            }}
          >
            💫
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 240, rotate: 0 }}
            animate={{
              y: [null, 105, 155, 105],
              x: [null, 270, 220, 270],
              rotate: [null, -8, 8, -8],
            }}
            transition={{
              duration: 9.2,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            🦋
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 420, rotate: 0 }}
            animate={{
              y: [null, 125, 175, 125],
              x: [null, 450, 400, 450],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 8.7,
              repeat: Infinity,
              delay: 2.5,
              ease: "easeInOut",
            }}
          >
            ❤️
          </motion.div>
          {/* Floating pride words rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 100, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            PRIDE
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 300, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            LOVE
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 500, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            EQUALITY
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 200, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            AUTHENTIC
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 400, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            FREE
          </motion.div>
        </>
      ) : themeId === 'patriotparadox' ? (
        <>
          {/* Floating patriotic symbols for Patriot Paradox */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 70, rotate: 0 }}
            animate={{
              y: [null, 110, 160, 110],
              x: [null, 100, 50, 100],
              rotate: [null, 12, -12, 12],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🇺🇸
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 400, rotate: 0 }}
            animate={{
              y: [null, 125, 175, 125],
              x: [null, 430, 380, 430],
              rotate: [null, -10, 10, -10],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 180, rotate: 0 }}
            animate={{
              y: [null, 140, 190, 140],
              x: [null, 210, 160, 210],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut",
            }}
          >
            🗽
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 520, rotate: 0 }}
            animate={{
              y: [null, 115, 165, 115],
              x: [null, 550, 500, 550],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7.8,
              repeat: Infinity,
              delay: 3,
              ease: "easeInOut",
            }}
          >
            🦅
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 300, rotate: 0 }}
            animate={{
              y: [null, 130, 180, 130],
              x: [null, 330, 280, 330],
              rotate: [null, 8, -8, 8],
            }}
            transition={{
              duration: 8.2,
              repeat: Infinity,
              delay: 1.5,
              ease: "easeInOut",
            }}
          >
            🎆
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 250, rotate: 0 }}
            animate={{
              y: [null, 105, 155, 105],
              x: [null, 280, 230, 280],
              rotate: [null, -8, 8, -8],
            }}
            transition={{
              duration: 9.2,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            📜
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: 450, rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: [null, 480, 430, 480],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 8.7,
              repeat: Infinity,
              delay: 2.5,
              ease: "easeInOut",
            }}
          >
            ⚖️
          </motion.div>
          {/* Floating patriotic words rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 100, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            FREEDOM
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 300, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            TRUTH
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 500, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            JUSTICE
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 200, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 9,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ACCOUNTABILITY
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: 400, rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 12,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            UNITY
          </motion.div>
        </>
      ) : themeId === 'fallforward' ? (
        <>
          {/* Floating autumn symbols for Fall Forward */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🍂
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, -10, 10, -10],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🍁
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 140, 190, 140],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8.5,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut",
            }}
          >
            🥀
          </motion.div>
          {/* Floating growth words rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            GROWTH
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            FALL
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "80%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 6,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            FORWARD
          </motion.div>
          {/* Pulsing autumn symbols */}
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "25%", y: 200, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 200 - 30, 200],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🍂
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl opacity-25 pointer-events-none"
            initial={{ x: "75%", y: 400, scale: 0, rotate: 0 }}
            animate={{
              y: [null, 400 - 30, 400],
              scale: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🌱
          </motion.div>
        </>
      ) : themeId === 'frighttovote' ? (
        <>
          {/* Floating spooky vote symbols for Fright to Vote */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🗳️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🎃
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "70%", rotate: 0 }}
            animate={{
              y: [null, 140, 190, 140],
              x: ["75%", "70%", "65%", "70%"],
              rotate: [null, 10, -10, 10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: 4,
              ease: "easeInOut",
            }}
          >
            👻
          </motion.div>
          {/* Floating spooky words rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            VOTE
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            VOICE
          </motion.div>
        </>
      ) : themeId === 'gatherround' ? (
        <>
          {/* Floating feast symbols for Gather Round */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🍽️
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🦃
          </motion.div>
          {/* Floating gratitude words rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            GATHER
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            THANKS
          </motion.div>
        </>
      ) : themeId === 'under-the-mistletoe' ? (
        <>
          {/* Floating holiday symbols for Under the Mistletoe */}
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "10%", rotate: 0 }}
            animate={{
              y: [null, 100, 150, 100],
              x: ["15%", "10%", "5%", "10%"],
              rotate: [null, 15, -15, 15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut",
            }}
          >
            🎄
          </motion.div>
          <motion.div
            className="absolute opacity-30 pointer-events-none text-5xl"
            initial={{ y: -100, x: "40%", rotate: 0 }}
            animate={{
              y: [null, 120, 170, 120],
              x: ["45%", "40%", "35%", "40%"],
              rotate: [null, 20, -20, 20],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              delay: 2,
              ease: "easeInOut",
            }}
          >
            🎁
          </motion.div>
          {/* Floating holiday words rising */}
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "20%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 0,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            JOY
          </motion.div>
          <motion.div
            className="absolute text-4xl md:text-6xl font-black opacity-15 text-white pointer-events-none"
            initial={{ y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, x: "50%", rotate: 0 }}
            animate={{
              y: -200,
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: 3,
              ease: "linear",
            }}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            LOVE
          </motion.div>
        </>
      ) : (
        <>
          {/* Floating puzzle pieces for Class Act (default) */}
          <FloatingPuzzlePiece delay={0} color={themeAesthetic.accentColors[0]} />
          <FloatingPuzzlePiece delay={2} color={themeAesthetic.accentColors[1]} />
          <FloatingPuzzlePiece delay={4} color={themeAesthetic.accentColors[2]} />
          <FloatingPuzzlePiece delay={6} color={themeAesthetic.accentColors[3]} />

          {/* Floating grades */}
          <FloatingGrade grade="A+" delay={0} startX={"20%"} />
          <FloatingGrade grade="B" delay={3} startX={"50%"} />
          <FloatingGrade grade="C-" delay={6} startX={"80%"} />
          <FloatingGrade grade="F" delay={9} startX={"35%"} />
          <FloatingGrade grade="A" delay={12} startX={"65%"} />

          {/* Paper airplanes */}
          <PaperAirplane delay={0} />
          <PaperAirplane delay={4} />
          <PaperAirplane delay={8} />

          {/* Gold stars */}
          <GoldStar delay={0} startX={"15%"} startY={200} />
          <GoldStar delay={2} startX={"75%"} startY={400} />
          <GoldStar delay={4} startX={"45%"} startY={600} />
          <GoldStar delay={6} startX={"95%"} startY={300} />
        </>
      )}
      </div>

      {/* Hero Section */}
      <div className={`max-w-2xl mx-auto px-3 md:px-6 py-6 md:py-12 relative ${isOnCooldown && nextAvailableDate ? 'pt-32 md:pt-36' : 'pt-20 md:pt-24'}`}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 text-center relative"
        >
          {/* Theme Badge */}
          <motion.div
            className={`absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 rounded-full text-white font-bold text-xl md:text-2xl flex items-center justify-center border-4 border-white shadow-2xl transform rotate-12 ${themeAesthetic.badgeBg
              }`}
            animate={{ rotate: [12, 8, 12] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {themeAesthetic.badgeEmoji}
          </motion.div>

          <motion.div
            className="inline-block mb-3"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ThemeIcon className={`w-14 h-14 drop-shadow-lg ${themeId === 'unapologeticallyproud'
              ? 'text-pink-300'
              : themeId === 'patriotparadox'
                ? 'text-red-200'
                : themeId === 'newbeginnings'
                  ? 'text-teal-300'
                  : themeId === 'rootsoflove'
                    ? 'text-red-300'
                    : themeId === 'shereigns'
                      ? 'text-purple-300'
                      : themeId === 'worldofwaste'
                        ? 'text-emerald-300'
                        : themeId === 'echoesoftheeast'
                          ? 'text-amber-300'
                          : themeId === 'fathersofchange'
                            ? 'text-red-300'
                            : 'text-yellow-300'
              }`} />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-black text-white italic mb-6 tracking-wide drop-shadow-lg">
            {themeAesthetic.archiveSectionName || '📌 Community Bulletin Board'}
          </h2>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-[0.06em] uppercase drop-shadow-2xl"
            style={{ fontFamily: 'var(--font-heading)' }}>
            {theme.title}
          </h1>

          <motion.div
            className="inline-block px-6 py-2 bg-black/50 backdrop-blur-md rounded-full border-4 border-yellow-400 shadow-2xl"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-lg text-yellow-300 font-black drop-shadow-lg"
              style={{ fontFamily: 'var(--font-body)' }}>
              {themeAesthetic.archiveName}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Sticky Tab Navigation */}
      <StickyTabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasCooldownBanner={isOnCooldown && !!nextAvailableDate}
      />

      <div className="max-w-2xl mx-auto px-3 md:px-6 py-4 md:py-6 relative">

        {/* Overview Section */}
        <motion.section
          ref={overviewRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
          id="overview"
        >
          <h2 className="text-3xl font-black mb-6 text-center text-white drop-shadow-lg"
            style={{ fontFamily: 'var(--font-heading)' }}>
            Overview
          </h2>
          <OverviewCarousel theme={theme} />
        </motion.section>

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-6 relative h-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Music Section */}
        <motion.section
          ref={musicRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
          id="music"
        >
          <motion.h2
            className="text-3xl font-black mb-4 text-center text-white drop-shadow-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {theme.musicSectionTitle || (themeId === 'newbeginnings' ? '🌅 THE RENEWAL SOUNDTRACK' : themeId === 'rootsoflove' ? '❤️ THE LEGACY SOUNDTRACK' : themeId === 'shereigns' ? '👑 THE ROYAL ANTHEM' : themeId === 'echoesoftheeast' ? '🌏 THE CULTURAL BRIDGE ANTHEM' : themeId === 'fathersofchange' ? '🛡️ THE LIBERATION ANTHEM' : themeId === 'unapologeticallyproud' ? '🏳️‍🌈 THE PRIDE ANTHEM' : themeId === 'patriotparadox' ? '🇺🇸 THE PARADOX ANTHEM' : themeId === 'fallforward' ? '🍂 THE GROWTH ANTHEM' : themeId === 'frighttovote' ? '🗳️ THE DEMOCRACY ANTHEM' : themeId === 'gatherround' ? '🍽️ THE GRATITUDE ANTHEM' : themeId === 'under-the-mistletoe' ? '🎄 THE HOLIDAY LOVE ANTHEM' : themeId === 'worldofwaste' ? '🌍 THE SUSTAINABILITY ANTHEM' : '📼 THE SOUNDTRACK')}
          </motion.h2>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 border-8 border-black rounded-2xl p-4 shadow-2xl">
            {/* YouTube Embed */}
            <div className="aspect-video mb-4 rounded-lg overflow-hidden border-4 border-yellow-400 shadow-xl">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${theme.musicYoutubeVideoId || theme.youtubeVideoId}`}
                title="Theme Music Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Add to Library Button */}
            <Button
              onClick={() => window.open(theme.musicLibraryLink || MUSIC_LIBRARY_LINKS[themeId], '_blank')}
              className="w-full font-black text-lg py-6 rounded-xl border-4 transition-all bg-yellow-400 border-yellow-600 text-black hover:bg-yellow-300 hover:scale-105"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {theme.musicSectionButtonText || 'add to my library'}
            </Button>
            <p className="text-center text-white/90 text-sm mt-2 font-medium">
              {theme.musicSectionCaption || 'Save this song to access it anytime in your personal collection'}
            </p>
          </div>
        </motion.section>

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-6 relative h-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Reflect Section */}
        <motion.section
          ref={reflectRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
          id="reflect"
        >
          <motion.h2
            className="text-3xl font-black mb-6 text-center text-white drop-shadow-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {themeAesthetic.reflectionCallToAction}
          </motion.h2>

          <div className={`border-8 rounded-2xl p-6 shadow-2xl relative overflow-hidden ${themeId === 'newbeginnings'
            ? 'bg-gradient-to-br from-cyan-50 via-pink-50 to-lime-50 border-teal-400'
            : themeId === 'rootsoflove'
              ? 'bg-gradient-to-br from-rose-50 via-amber-50 to-red-50 border-amber-900'
              : themeId === 'shereigns'
                ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 border-purple-600'
                : themeId === 'worldofwaste'
                  ? 'bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 border-slate-700'
                  : themeId === 'echoesoftheeast'
                    ? 'bg-gradient-to-br from-indigo-50 via-red-50 to-amber-50 border-indigo-900'
                    : themeId === 'fathersofchange'
                      ? 'bg-gradient-to-br from-red-50 via-amber-50 to-blue-50 border-red-700'
                      : themeId === 'unapologeticallyproud'
                        ? 'bg-gradient-to-br from-red-50 via-yellow-50 via-green-50 via-blue-50 to-purple-50 border-pink-600'
                        : themeId === 'patriotparadox'
                          ? 'bg-gradient-to-br from-slate-100 via-red-50 to-blue-50 border-slate-700'
                          : 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-800'
            }`}>
            {/* Theme-specific decorative pattern */}
            {themeId === 'newbeginnings' ? (
              // Fresh sprout and butterfly pattern for New Beginnings
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Gentle wave line */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 25,${10 + (i % 2) * 5} 50,15 T 100,15`}
                        stroke="#7DD3C0"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>
                    {/* Sprouts, leaves, and butterflies along the line */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 4 === 0 ? '#7DD3C0' : j % 4 === 1 ? '#AED581' : j % 4 === 2 ? '#F8BBD0' : '#81D4FA',
                            transform: `rotate(${(j % 5) * 6 - 12}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '🌱' : j % 3 === 1 ? '🦋' : '🍃'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'rootsoflove' ? (
              // Heart vine decorative pattern for Roots of Love
              <div className="absolute inset-0 pointer-events-none opacity-30">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Flowing vine line */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 20,${12 + (i % 3) * 6} 40,15 Q 60,${18 - (i % 3) * 6} 80,15 Q 90,${12 + (i % 2) * 4} 100,15`}
                        stroke="#8B4513"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>
                    {/* Hearts along the vine */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 3 === 0 ? '#DC143C' : j % 3 === 1 ? '#800020' : '#DAA520',
                            transform: `rotate(${(j % 5) * 8 - 16}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          ❤
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'shereigns' ? (
              // Royal crown and ornamental pattern for She Reigns
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Elegant wave line */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 25,${12 + (i % 2) * 6} 50,15 T 100,15`}
                        stroke="#8B008B"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                    {/* Crowns and royal symbols along the line */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 4 === 0 ? '#8B008B' : j % 4 === 1 ? '#DAA520' : j % 4 === 2 ? '#C71585' : '#E6E6FA',
                            transform: `rotate(${(j % 5) * 5 - 10}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '👑' : j % 3 === 1 ? '✨' : '💜'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'worldofwaste' ? (
              // Recycling and environmental pattern for World of Waste
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Wavy lines like waste flow */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 20,${10 + (i % 3) * 4} 40,15 Q 60,${20 - (i % 3) * 4} 80,15 Q 90,${12 + (i % 2) * 3} 100,15`}
                        stroke="#475569"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.6"
                      />
                    </svg>
                    {/* Recycling symbols and environmental icons along the line */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 4 === 0 ? '#059669' : j % 4 === 1 ? '#475569' : j % 4 === 2 ? '#ea580c' : '#1e293b',
                            transform: `rotate(${(j % 5) * 7 - 14}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '♻️' : j % 3 === 1 ? '🌍' : '🗑️'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'echoesoftheeast' ? (
              // Interwoven geometric pattern for Echoes of the East
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Geometric wave pattern combining Asian and African textile motifs */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 15,${10 + (i % 2) * 6} 30,15 T 60,15 Q 75,${18 - (i % 2) * 6} 90,15 T 100,15`}
                        stroke="#1C2A5A"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.5"
                      />
                      <path
                        d={`M 0,18 Q 20,${14 + (i % 3) * 4} 40,18 T 80,18 Q 90,${16 + (i % 2) * 3} 100,18`}
                        stroke="#B22234"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                    {/* Cultural symbols along the pattern */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 4 === 0 ? '#1C2A5A' : j % 4 === 1 ? '#B22234' : j % 4 === 2 ? '#D4AF37' : '#1C2A5A',
                            transform: `rotate(${(j % 5) * 6 - 12}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 4 === 0 ? '🎋' : j % 4 === 1 ? '🎶' : j % 4 === 2 ? '🌏' : '🪷'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'fathersofchange' ? (
              // Juneteenth-inspired pattern for Fathers of Change
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Interwoven lines representing legacy and connection */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,12 Q 25,${8 + (i % 2) * 8} 50,12 T 100,12`}
                        stroke="#1C2D4A"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                      />
                      <path
                        d={`M 0,18 Q 25,${22 - (i % 2) * 8} 50,18 T 100,18`}
                        stroke="#C1121F"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.5"
                      />
                      <path
                        d={`M 0,15 L 100,15`}
                        stroke="#D4AF37"
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.4"
                        strokeDasharray="5,5"
                      />
                    </svg>
                    {/* Symbols of fatherhood, protection, and legacy */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 4 === 0 ? '#1C2D4A' : j % 4 === 1 ? '#C1121F' : j % 4 === 2 ? '#D4AF37' : '#6B4F3A',
                            transform: `rotate(${(j % 5) * 5 - 10}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 4 === 0 ? '🛡️' : j % 4 === 1 ? '⭐' : j % 4 === 2 ? '🕊️' : '🔗'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'unapologeticallyproud' ? (
              // Rainbow pride pattern for Unapologetically Proud
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Rainbow wave pattern */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,${10 + (i % 3) * 2} Q 16.67,${5 + (i % 2) * 10} 33.33,${10 + (i % 3) * 2} T 66.67,${10 + (i % 3) * 2} T 100,${10 + (i % 3) * 2}`}
                        stroke="#E63946"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                      <path
                        d={`M 0,${13 + (i % 3) * 2} Q 16.67,${8 + (i % 2) * 10} 33.33,${13 + (i % 3) * 2} T 66.67,${13 + (i % 3) * 2} T 100,${13 + (i % 3) * 2}`}
                        stroke="#F77F00"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                      <path
                        d={`M 0,${16 + (i % 3) * 2} Q 16.67,${11 + (i % 2) * 10} 33.33,${16 + (i % 3) * 2} T 66.67,${16 + (i % 3) * 2} T 100,${16 + (i % 3) * 2}`}
                        stroke="#F9C74F"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                      <path
                        d={`M 0,${19 + (i % 3) * 2} Q 16.67,${14 + (i % 2) * 10} 33.33,${19 + (i % 3) * 2} T 66.67,${19 + (i % 3) * 2} T 100,${19 + (i % 3) * 2}`}
                        stroke="#2A9D8F"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                      <path
                        d={`M 0,${22 + (i % 3) * 2} Q 16.67,${17 + (i % 2) * 10} 33.33,${22 + (i % 3) * 2} T 66.67,${22 + (i % 3) * 2} T 100,${22 + (i % 3) * 2}`}
                        stroke="#4361EE"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                      <path
                        d={`M 0,${25 + (i % 3) * 2} Q 16.67,${20 + (i % 2) * 10} 33.33,${25 + (i % 3) * 2} T 66.67,${25 + (i % 3) * 2} T 100,${25 + (i % 3) * 2}`}
                        stroke="#9D4EDD"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                    </svg>
                    {/* Pride symbols */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(6)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 6 === 0 ? '#E63946' : j % 6 === 1 ? '#F77F00' : j % 6 === 2 ? '#F9C74F' : j % 6 === 3 ? '#2A9D8F' : j % 6 === 4 ? '#4361EE' : '#9D4EDD',
                            transform: `rotate(${(j % 5) * 7 - 14}deg) scale(${0.9 + (j % 3) * 0.15})`
                          }}
                        >
                          {j % 6 === 0 ? '🏳️‍🌈' : j % 6 === 1 ? '❤️' : j % 6 === 2 ? '✨' : j % 6 === 3 ? '🌈' : j % 6 === 4 ? '💫' : '🦋'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'fallforward' ? (
              // Autumn leaf pattern for Fall Forward
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 25,${10 + (i % 2) * 5} 50,15 T 100,15`}
                        stroke="#C75B12"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 3 === 0 ? '#C75B12' : j % 3 === 1 ? '#E6A23C' : '#B33A3A',
                            transform: `rotate(${(j % 5) * 6 - 12}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '🍂' : j % 3 === 1 ? '🍁' : '🥀'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'frighttovote' ? (
              // Spooky vote pattern for Fright to Vote
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 15,${12 + (i % 2) * 6} 30,15 T 60,15 Q 75,${18 - (i % 2) * 6} 90,15 T 100,15`}
                        stroke="#B22234"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            transform: `rotate(${(j % 5) * 8 - 16}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '🗳️' : j % 3 === 1 ? '🎃' : '👻'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'gatherround' ? (
              // Feast pattern for Gather Round
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 20,${10 + (i % 3) * 4} 40,15 Q 60,${20 - (i % 3) * 4} 80,15 Q 90,${12 + (i % 2) * 3} 100,15`}
                        stroke="#C75B12"
                        strokeWidth="1"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            transform: `rotate(${(j % 5) * 5 - 10}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '🍽️' : j % 3 === 1 ? '🦃' : '🥧'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'under-the-mistletoe' ? (
              // Holiday pattern for Under the Mistletoe
              <div className="absolute inset-0 pointer-events-none opacity-25">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M 0,15 Q 25,${12 + (i % 2) * 6} 50,15 T 100,15`}
                        stroke="#B33A3A"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(7)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            transform: `rotate(${(j % 5) * 7 - 14}deg) scale(${0.9 + (j % 3) * 0.1})`
                          }}
                        >
                          {j % 3 === 0 ? '🎄' : j % 3 === 1 ? '🎁' : '❄️'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : themeId === 'patriotparadox' ? (
              // Fragmented stars and stripes pattern for Patriot Paradox
              <div className="absolute inset-0 pointer-events-none opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative" style={{ marginTop: i === 0 ? '2rem' : '3.5rem' }}>
                    {/* Layered stripe fragments */}
                    <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                      <path
                        d={`M ${i % 2 === 0 ? 0 : 20},${12 + (i % 2) * 3} L ${i % 2 === 0 ? 40 : 70},${12 + (i % 2) * 3}`}
                        stroke="#B22234"
                        strokeWidth="3"
                        fill="none"
                        opacity="0.6"
                      />
                      <path
                        d={`M ${i % 2 === 0 ? 50 : 10},${18 + (i % 2) * 2} L ${i % 2 === 0 ? 90 : 45},${18 + (i % 2) * 2}`}
                        stroke="#1C2D4A"
                        strokeWidth="2.5"
                        fill="none"
                        opacity="0.5"
                      />
                    </svg>
                    {/* Stars and symbols along the line */}
                    <div className="absolute inset-0 flex justify-around items-center px-4">
                      {[...Array(6)].map((_, j) => (
                        <span
                          key={j}
                          className="text-lg drop-shadow-md"
                          style={{
                            color: j % 4 === 0 ? '#B22234' : j % 4 === 1 ? '#1C2D4A' : j % 4 === 2 ? '#6C757D' : '#F5F5F5',
                            transform: `rotate(${(j % 5) * 8 - 16}deg) scale(${0.85 + (j % 3) * 0.2})`,
                            opacity: 0.7
                          }}
                        >
                          {j % 4 === 0 ? '⭐' : j % 4 === 1 ? '🗽' : j % 4 === 2 ? '🦅' : '⚖️'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Notebook paper lines for Class Act (default)
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-400"></div>
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-t border-blue-300"
                    style={{ marginTop: i === 0 ? '3rem' : '2rem' }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10">
              <motion.div
                className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 border-2 md:border-4 border-blue-500 shadow-2xl"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-lg md:text-2xl text-center text-gray-900 leading-relaxed font-black italic"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  "{theme.currentPrompt || (theme.prompts && theme.prompts[0]) || 'Take a moment to reflect on your journey.'}"
                </p>
              </motion.div>

              <div className="mb-6">
                <ReflectionRewardsCollapsible />
              </div>

              <EnhancedReflection
                onReflectionSubmit={handleReflectionSubmit}
                completedReflections={completedReflections}
                randomArchiveReflection={randomArchiveReflection}
                isInFollowUpWindow={isInFollowUpWindow}
                hasSubmittedMainReflection={hasSubmittedMainReflection}
                submittedPrimaryReflection={submittedPrimaryReflection}
                nextPromptDate={getNextPromptDate()}
                followUpQuestions={
                  theme.currentFollowUpQuestions || theme.followUpQuestions
                    ? {
                      'follow-up':
                        (theme.currentFollowUpQuestions || theme.followUpQuestions)?.['follow-up'] ??
                        (theme.currentFollowUpQuestions || theme.followUpQuestions)?.conversationReply,
                      deeper:
                        (theme.currentFollowUpQuestions || theme.followUpQuestions)?.deeper ??
                        (theme.currentFollowUpQuestions || theme.followUpQuestions)?.reflectionChain,
                      'archive-response':
                        (theme.currentFollowUpQuestions || theme.followUpQuestions)?.['archive-response'] ??
                        (theme.currentFollowUpQuestions || theme.followUpQuestions)?.archiveResponse,
                      perspective: (theme.currentFollowUpQuestions || theme.followUpQuestions)?.perspective,
                      'time-shift': (theme.currentFollowUpQuestions || theme.followUpQuestions)?.['time-shift'],
                    }
                    : undefined
                }
              />

              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl text-center shadow-2xl border-4 border-white"
                >
                  <p className="text-white font-black text-xl md:text-2xl flex items-center justify-center gap-2 drop-shadow-xl"
                    style={{ fontFamily: 'var(--font-body)' }}>
                    <Sparkles className="w-6 h-6" />
                    Gold Star! You earned {tokensEarned} Tokens! ⭐
                  </p>
                </motion.div>
              )}

              <div className="text-center mt-6">
                <p className="text-amber-900 font-black text-base mb-2"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  📝 Every response builds the collective wisdom archive
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-6 relative h-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Rewards Section */}
        <motion.section
          ref={rewardsRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
          id="rewards"
        >
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-center text-white drop-shadow-lg flex items-center justify-center gap-3"
            style={{ fontFamily: 'var(--font-heading)' }}>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
            {themeAesthetic.progressReportName}
          </h2>

          <p className="text-center text-white text-sm font-semibold mb-6 bg-black/30 backdrop-blur-sm px-6 py-2 rounded-lg block mx-auto max-w-md">
            {theme.rewardSectionDescription || "Track your Vibe Tokens and unlock exclusive rewards from the Vibes & Virtues store"}
          </p>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 border-4 md:border-8 border-yellow-400 shadow-2xl">
            <AnimatedTokenProgress
              tokens={tokens}
              expiresAt={tokenExpiresAt}
              unlockedRewards={currentUnlockedRewards}
              redeemedRewards={redeemedRewards}
              userId={userId}
              themeId={themeId}
              onRedeemCode={handleRedeemCode}
              rewardTiers={REWARD_TIERS}
            />
          </div>
        </motion.section>

        {/* Reward Unlock Modal */}
        {newlyUnlockedReward && (
          <RewardUnlockModal
            isOpen={showRewardModal}
            onClose={() => setShowRewardModal(false)}
            rewardTierData={REWARD_TIERS.find(t => t.tokens === newlyUnlockedReward) || REWARD_TIERS[0]}
            onRedeem={handleRewardRedeem}
            daysUntilExpiration={getDaysUntilExpiration()}
            onCloseComplete={handleRewardModalClose}
          />
        )}

        {/* Coupon Code Modal */}
        {currentCoupon && (
          <CouponCodeModal
            isOpen={showCouponModal}
            onClose={() => {
              setShowCouponModal(false);
              setCurrentCoupon(null);
            }}
            discount={currentCoupon.discount}
            code={currentCoupon.code}
            tokensRedeemed={currentCoupon.tokensRedeemed}
            onCloseComplete={handleCouponModalClose}
          />
        )}

        {/* Follow-Up Reflection Modal */}
        <FollowUpReflectionModal
          isOpen={showFollowUpModal}
          onClose={() => setShowFollowUpModal(false)}
          tokensEarned={tokensEarned}
          onStartTimer={handleStartTimer}
          daysUntilNextPrompt={getDaysUntilNextPrompt()}
        />

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-6 relative h-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Archive Section */}
        <motion.section
          ref={archiveRef}
          initial={{ opacity: 0, rotate: -2 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
          id="archive"
        >
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-center text-white drop-shadow-lg tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-heading)' }}>
            {themeAesthetic.archiveSectionName}
          </h2>

          <p className="text-center text-white text-sm font-semibold mb-6 bg-black/30 backdrop-blur-sm px-6 py-2 rounded-lg block mx-auto max-w-md">
            Read anonymous reflections from other visitors and see how your perspective connects with the community
          </p>

          <div className={`p-4 md:p-8 rounded-2xl shadow-2xl border-4 md:border-8 relative ${themeId === 'newbeginnings'
            ? 'bg-gradient-to-br from-teal-700 to-emerald-800 border-teal-600'
            : themeId === 'rootsoflove'
              ? 'bg-gradient-to-br from-amber-900 to-red-900 border-amber-800'
              : themeId === 'shereigns'
                ? 'bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700'
                : themeId === 'worldofwaste'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
                  : themeId === 'echoesoftheeast'
                    ? 'bg-gradient-to-br from-indigo-900 to-red-900 border-indigo-800'
                    : themeId === 'fathersofchange'
                      ? 'bg-gradient-to-br from-red-900 to-blue-900 border-red-800'
                      : themeId === 'unapologeticallyproud'
                        ? 'bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 border-pink-700'
                        : themeId === 'patriotparadox'
                          ? 'bg-gradient-to-br from-slate-900 via-red-900 to-blue-900 border-slate-700'
                          : 'bg-gradient-to-br from-orange-900 to-amber-800 border-amber-900'
            }`}>
            {/* Theme-specific texture effect */}
            <div className="absolute inset-0 opacity-20 rounded-xl" style={{
              backgroundImage: themeId === 'worldofwaste'
                ? 'linear-gradient(45deg, #475569 25%, transparent 25%, transparent 75%, #475569 75%, #475569), linear-gradient(45deg, #475569 25%, transparent 25%, transparent 75%, #475569 75%, #475569)'
                : themeId === 'echoesoftheeast'
                  ? 'linear-gradient(90deg, #1C2A5A 1px, transparent 1px), linear-gradient(#1C2A5A 1px, transparent 1px)'
                  : themeId === 'fathersofchange'
                    ? 'linear-gradient(135deg, #C1121F 2px, transparent 2px), linear-gradient(45deg, #D4AF37 1px, transparent 1px)'
                    : themeId === 'unapologeticallyproud'
                      ? 'repeating-linear-gradient(45deg, #E63946 0px, #F77F00 10px, #F9C74F 20px, #2A9D8F 30px, #4361EE 40px, #9D4EDD 50px, transparent 60px, transparent 80px)'
                      : themeId === 'patriotparadox'
                        ? 'repeating-linear-gradient(90deg, #B22234 0px, #B22234 2px, transparent 2px, transparent 8px, #1C2D4A 8px, #1C2D4A 10px, transparent 10px, transparent 16px)'
                        : 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: themeId === 'worldofwaste' ? '20px 20px' : themeId === 'echoesoftheeast' ? '15px 15px' : themeId === 'fathersofchange' ? '25px 25px' : themeId === 'unapologeticallyproud' ? '100px 100px' : themeId === 'patriotparadox' ? '60px 60px' : '20px 20px',
              backgroundPosition: themeId === 'worldofwaste' ? '0 0, 10px 10px' : '0 0'
            }}></div>

            <div className="relative z-10">
              <ArchiveCarousel reflections={[
                ...(theme.featuredReflections || []).map(f => ({
                  content: f.content,
                  timestamp: new Date().toISOString(),
                  author: f.author
                })),
                ...archiveReflections
              ]} />
            </div>
          </div>
        </motion.section>

        {/* Animated Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="my-6 relative h-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>

        {/* Extra Credit / Continue Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center space-y-4 pb-12"
        >
          <h3 className="text-xl md:text-2xl font-black text-white mb-4 drop-shadow-lg" style={{ fontFamily: 'var(--font-heading)' }}>
            {theme.archiveSectionHeading || getContinueHeading(themeId, theme.reflectionCallToAction)}
          </h3>
          <p className="text-center text-white text-sm font-semibold mb-6 bg-black/30 backdrop-blur-sm px-6 py-2 rounded-lg block mx-auto max-w-md">
            {theme.archiveSectionCaption || "Continue your journey with exclusive offers and deeper exploration"}
          </p>
          <div className="space-y-4">
            {(theme.footerLinks && theme.footerLinks.length > 0) ? (
              theme.footerLinks.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.url}
                  target={link.url.startsWith('http') ? "_blank" : undefined}
                  rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className={`block text-white font-black py-4 px-6 rounded-xl shadow-2xl border-4 border-white text-lg ${i % 3 === 0 ? "bg-gradient-to-r from-pink-500 to-rose-600" :
                    i % 3 === 1 ? "bg-gradient-to-r from-purple-500 to-indigo-600" :
                      "bg-gradient-to-r from-cyan-500 to-blue-600"
                    }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {link.label}
                </motion.a>
              ))
            ) : (
              <>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="block bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4 px-6 rounded-xl shadow-2xl border-4 border-white text-lg"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  🖼️ Own the Original Artwork
                </motion.a>

                <motion.a
                  href="https://vibesandvirtues.com/products/keychain?_pos=2&_psq=keychain&_ss=e&_v=1.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="block bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black py-4 px-6 rounded-xl shadow-2xl border-4 border-white text-lg"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  🔑 Unlock the Wildcard Master Key
                </motion.a>

                <motion.a
                  href="https://qrco.de/becovv"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 px-6 rounded-xl shadow-2xl border-4 border-white text-lg"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  📱 Stay Connected
                </motion.a>
              </>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}