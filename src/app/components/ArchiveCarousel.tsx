import { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Reflection {
  content: string;
  timestamp: string;
  author?: string;
}

interface ArchiveCarouselProps {
  reflections: Reflection[];
}

function ArchiveSlide({ reflection, index }: { reflection: Reflection; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current && !isExpanded) {
      const el = textRef.current;
      // Standard line height for text-lg leading-relaxed is roughly 1.625 * size (18px) = ~29px
      // 10 lines is roughly 290px.
      // el.scrollHeight tells us the full height of the text content.
      // clientHeight will be clamped by line-clamp.
      
      // Let's use a more direct approach: check if scrollHeight > clientHeight
      if (el.scrollHeight > el.clientHeight + 5) {
        setIsClamped(true);
      }
    }
  }, [reflection.content, isExpanded]);

  return (
    <div className="px-2 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card 
          onClick={() => (isClamped || isExpanded) && setIsExpanded(!isExpanded)}
          className={`p-4 md:p-6 bg-yellow-100 border-2 md:border-4 border-yellow-300 shadow-xl transition-all duration-500 relative flex flex-col items-center justify-center overflow-hidden ${isExpanded ? 'min-h-[400px]' : 'min-h-[220px]'} ${(isClamped || isExpanded) ? 'cursor-pointer hover:bg-yellow-50' : ''}`}
        >
          {/* Push pin */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 border-2 border-red-700 shadow-lg z-20"></div>
          
          <div className="w-full flex flex-col items-center">
            <p 
              ref={textRef}
              className={`text-base md:text-lg text-gray-900 leading-relaxed italic font-bold text-center w-full max-w-full transition-all duration-300 ${isExpanded ? '' : 'line-clamp-[10]'}`}
              style={{ 
                fontFamily: 'var(--font-body)', 
                wordBreak: 'break-word', 
                overflowWrap: 'break-word',
                display: isExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: isExpanded ? 'unset' : 10,
                WebkitBoxOrient: 'vertical'
              }}
            >
              "{reflection.content}"
            </p>
          </div>

          {!isExpanded && reflection.author && (
            <p className="absolute bottom-4 right-6 text-xs font-black text-yellow-600 uppercase tracking-widest opacity-80">
              — {reflection.author}
            </p>
          )}
          
          {isExpanded && reflection.author && (
            <p className="mt-6 text-sm font-black text-yellow-600 uppercase tracking-widest opacity-80 text-center w-full">
              — {reflection.author}
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export function ArchiveCarousel({ reflections }: ArchiveCarouselProps) {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: reflections.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: true,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    draggable: true,
    dotsClass: 'slick-dots !bottom-[-30px]',
    customPaging: () => (
      <div className="w-2 h-2 bg-yellow-300/50 rounded-full hover:bg-yellow-300 transition-colors" />
    ),
  };

  if (reflections.length === 0) {
    return (
      <Card className="p-12 bg-yellow-50 border-4 border-dashed border-yellow-400 text-center">
        <p 
          className="text-gray-900 text-xl font-black"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          🎯 Be the first to post on the board!
        </p>
      </Card>
    );
  }

  return (
    <div className="archive-carousel relative px-10 md:px-0">
      <style>{`
        .archive-carousel .slick-dots li button:before {
          display: none;
        }
        .archive-carousel .slick-dots li.slick-active div {
          background: rgb(253 224 71);
        }
        .archive-carousel .slick-list {
          cursor: grab;
        }
        .archive-carousel .slick-list:active {
          cursor: grabbing;
        }
      `}</style>

      {/* Custom navigation arrows */}
      {reflections.length > 1 && (
        <>
          <button
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute left-0 md:left-[-40px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-yellow-300 hover:bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Previous reflection"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
          </button>
          <button
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute right-0 md:right-[-40px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-yellow-300 hover:bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Next reflection"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
          </button>
        </>
      )}

      <Slider ref={sliderRef} {...settings}>
        {reflections.map((reflection, index) => (
          <ArchiveSlide key={index} reflection={reflection} index={index} />
        ))}
      </Slider>

      <div className="text-center mt-12">
        <p 
          className="text-yellow-100 font-black text-lg drop-shadow-lg"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          ✨ Voices from students across the Wildcard community
        </p>
      </div>
    </div>
  );
}