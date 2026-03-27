import { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Puzzle, Music, BookOpen, GraduationCap, Sunrise, Heart, Crown, Trash2, Globe, Shield, Flag, Leaf, Vote, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
const graduationArtwork = 'https://placehold.co/600x400?text=graduationArtwork';
const newBeginningsArtwork = 'https://placehold.co/600x400?text=newBeginningsArtwork';
const rootsOfLoveArtwork = 'https://placehold.co/600x400?text=rootsOfLoveArtwork';
const sheReignsArtwork = 'https://placehold.co/600x400?text=sheReignsArtwork';
const worldOfWasteArtwork = 'https://placehold.co/600x400?text=worldOfWasteArtwork';
const echoesOfTheEastArtwork = 'https://placehold.co/600x400?text=echoesOfTheEastArtwork';
const fathersOfChangeArtwork = 'https://placehold.co/600x400?text=fathersOfChangeArtwork';
const unapologeticallyProudArtwork = 'https://placehold.co/600x400?text=unapologeticallyProudArtwork';
const patriotParadoxArtwork = 'https://placehold.co/600x400?text=patriotParadoxArtwork';
const fallForwardArtwork = 'https://placehold.co/600x400?text=fallForwardArtwork';
const frightToVoteArtwork = 'https://placehold.co/600x400?text=frightToVoteArtwork';
const gatherRoundArtwork = 'https://placehold.co/600x400?text=gatherRoundArtwork';
const underTheMistletoeArtwork = 'https://placehold.co/600x400?text=underTheMistletoeArtwork';

interface OverviewSlide {
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
}

interface Theme {
  title: string;
  youtubeVideoId: string;
  artworkUrl: string;
  themeDetails?: {
    artistStatement: string;
    yearCreated: string;
    medium: string;
    dimensions: string;
    inspiration: string;
  };
  externalLink?: string;
  musicLibraryLink?: string;
  overviewSlides?: OverviewSlide[];
}

interface OverviewCarouselProps {
  theme: Theme;
}

// Map artwork URLs to actual imported images (Fallback only)
const ARTWORK_MAP: Record<string, string> = {
  'https://placehold.co/600x400?text=a1f366': graduationArtwork,
  'https://placehold.co/600x400?text=94b2f5': newBeginningsArtwork,
  'https://placehold.co/600x400?text=42c483': rootsOfLoveArtwork,
  'https://placehold.co/600x400?text=c81c6f': sheReignsArtwork,
  'https://placehold.co/600x400?text=6fd616': worldOfWasteArtwork,
  'https://placehold.co/600x400?text=d203d3': echoesOfTheEastArtwork,
  'https://placehold.co/600x400?text=842fac': fathersOfChangeArtwork,
  'https://placehold.co/600x400?text=068b76': unapologeticallyProudArtwork,
  'https://placehold.co/600x400?text=c7822f': patriotParadoxArtwork,
  'https://placehold.co/600x400?text=dd3ecd': fallForwardArtwork,
  'https://placehold.co/600x400?text=f366e2': frightToVoteArtwork,
  'https://placehold.co/600x400?text=a4e5bf': gatherRoundArtwork,
  'https://placehold.co/600x400?text=57660e': underTheMistletoeArtwork,
};

export function OverviewCarousel({ theme }: OverviewCarouselProps) {
  const sliderRef = useRef<Slider>(null);

  const slides = theme.overviewSlides || [];

  // Helper function to render the correct icon based on name
  const renderIconComponent = (iconName: string, className: string = "w-10 h-10 md:w-12 md:h-12 text-purple-600") => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Flag': return <Flag className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'Vote': return <Vote className={className} />;
      case 'Users': return <Users className={className} />;
      case 'GraduationCap':
      default: return <GraduationCap className={className} />;
    }
  };

  const settings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: false,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    touchMove: true,
    dotsClass: 'slick-dots !bottom-4',
    customPaging: () => (
      <div className="w-3 h-3 bg-white/50 rounded-full hover:bg-white/80 transition-colors" />
    ),
  };

  return (
    <div className="overview-carousel">
      <style>{`
        .overview-carousel .slick-dots li button:before {
          display: none;
        }
        .overview-carousel .slick-dots li.slick-active div {
          background: white;
        }
        .overview-carousel .slick-list {
          cursor: grab;
        }
        .overview-carousel .slick-list:active {
          cursor: grabbing;
        }
        .overview-carousel .slick-track {
          display: flex !important;
          align-items: stretch !important;
        }
        .overview-carousel .slick-slide {
          height: auto !important;
          display: flex !important;
        }
        .overview-carousel .slick-slide > div {
          width: 100%;
          display: flex;
        }
      `}</style>

      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="px-2 h-full flex">
            {slide.type === 'image-cta' && (
              <Card className="border-2 md:border-4 border-white shadow-2xl overflow-hidden pb-12 w-full h-full flex flex-col justify-center" style={{ backgroundColor: '#0e0e0f' }}>
                <div className="relative">
                  {/* Puzzle piece decorative corners */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 text-yellow-400 z-10">
                    <Puzzle className="w-full h-full drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 text-pink-400 z-10">
                    <Puzzle className="w-full h-full drop-shadow-lg transform rotate-90" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 w-10 h-10 text-purple-400 z-10">
                    <Puzzle className="w-full h-full drop-shadow-lg transform -rotate-90" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 text-blue-400 z-10">
                    <Puzzle className="w-full h-full drop-shadow-lg transform rotate-180" />
                  </div>

                  <div className="aspect-[4/3] relative px-4" style={{ backgroundColor: '#0e0e0f' }}>
                    <ImageWithFallback
                      src={ARTWORK_MAP[slide.imageUrl || ''] || slide.imageUrl || graduationArtwork}
                      alt={slide.title || theme.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>

                {slide.ctaUrl && (
                  <div className="px-4 pb-4">
                    <a
                      href={slide.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg border-2 border-blue-400 transition-all hover:scale-105"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {slide.ctaText || "🔍 Learn More"}
                    </a>
                  </div>
                )}
              </Card>
            )}

            {slide.type === 'info' && (
              <Card className="bg-white/90 backdrop-blur-md border-2 md:border-4 border-yellow-300 shadow-2xl p-4 md:p-6 pb-12 w-full h-full flex flex-col justify-center">
                <div className="flex items-center justify-center mb-4">
                  {renderIconComponent(slide.icon || 'GraduationCap')}
                </div>
                <p
                  className="text-lg md:text-xl text-gray-900 leading-relaxed font-bold text-center"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {slide.description}
                </p>

                <div className="mt-6 flex justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 shadow-xl border-2 border-white"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        <BookOpen className="w-4 h-4" />
                        {slide.buttonText || "Read More"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-400">
                      <DialogHeader>
                        <DialogTitle
                          className="text-2xl text-purple-900"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          📖 {slide.title || theme.title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          Detailed information about the theme
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4" style={{ fontFamily: 'var(--font-body)' }}>
                        {slide.themeDetails ? (
                          <>
                            <div className="bg-white/95 rounded-lg p-6 border-4 border-purple-400 shadow-lg">
                              <h3 className="font-black text-xl mb-3 text-purple-900 flex items-center gap-2">
                                {renderIconComponent(slide.icon || 'GraduationCap', "w-6 h-6")}
                                Artist Statement
                              </h3>
                              <p className="text-gray-900 leading-relaxed text-base font-semibold">
                                {slide.themeDetails.artistStatement}
                              </p>
                            </div>

                            <Separator className="opacity-20" />

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-yellow-100 rounded-lg p-4 border-4 border-yellow-400 shadow-md">
                                <h4 className="font-black text-sm text-yellow-900 mb-1">📅 Year</h4>
                                <p className="text-yellow-900 font-black text-lg">{slide.themeDetails.yearCreated}</p>
                              </div>
                              <div className="bg-pink-100 rounded-lg p-4 border-4 border-pink-400 shadow-md">
                                <h4 className="font-black text-sm text-pink-900 mb-1">🎨 Medium</h4>
                                <p className="text-pink-900 font-black text-lg">{slide.themeDetails.medium}</p>
                              </div>
                              <div className="col-span-2 bg-purple-100 rounded-lg p-4 border-4 border-purple-400 shadow-md">
                                <h4 className="font-black text-sm text-purple-900 mb-1">📏 Dimensions</h4>
                                <p className="text-purple-900 font-black text-lg">{slide.themeDetails.dimensions}</p>
                              </div>
                            </div>

                            <Separator className="opacity-20" />

                            <div className="bg-white/95 rounded-lg p-6 border-4 border-blue-400 shadow-lg">
                              <h3 className="font-black text-xl mb-3 text-blue-900">
                                ✨ Inspiration
                              </h3>
                              <p className="text-gray-900 leading-relaxed text-base font-semibold">
                                {slide.themeDetails.inspiration}
                              </p>
                            </div>

                            <Separator className="opacity-20" />

                            <motion.a
                              href="https://www.etsy.com/shop/VibesandVirtues"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black py-4 px-6 rounded-xl shadow-2xl border-4 border-white text-lg text-center"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              🎨 Own the Original Artwork
                            </motion.a>
                          </>
                        ) : (
                          <p className="text-gray-800 text-center py-6 text-lg font-bold">
                            Information coming soon...
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            )}

            {slide.type === 'music' && (
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 md:border-8 border-gray-700 shadow-2xl p-4 md:p-6 pb-12 overflow-hidden w-full h-full flex flex-col justify-center">
                <div className="text-center mb-4">
                  <Music className="w-10 h-10 text-yellow-300 inline-block mb-2" />
                  <h3
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {slide.title || `The ${theme.title} Anthem`}
                  </h3>
                </div>

                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 border-4 border-gray-600">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${slide.youtubeVideoId}`}
                    title="Theme Song"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {slide.musicLibraryLink && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 shadow-xl"
                      onClick={() => {
                        window.open(slide.musicLibraryLink, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Music className="w-4 h-4" />
                      Add to My Music Library
                    </Button>
                  </motion.div>
                )}

                <p
                  className="text-center text-white font-bold text-sm mt-3"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  🎵 Every critique deserves a soundtrack
                </p>
              </Card>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
}