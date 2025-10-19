'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HighlightModal from './HighlightModal';

interface HighlightPost {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  html: string;
}

interface HighlightCarouselProps {
  posts: HighlightPost[];
}

export default function HighlightCarousel({ posts }: HighlightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<HighlightPost | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % posts.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [posts.length]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + posts.length) % posts.length);
  };

  const openModal = (post: HighlightPost) => {
    setSelectedPost(post);
  };

  if (posts.length === 0) {
    return (
      <div className="bg-discord-darker rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">📸</div>
        <h3 className="text-lg font-semibold text-white mb-2">No Highlights Yet</h3>
        <p className="text-discord-muted">Check back soon for fitness inspiration and tips!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-discord-darker rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent from @fitsitegonga</h2>

        <div className="relative">
          {/* Carousel Container */}
          <div className="overflow-hidden rounded-lg">
            <motion.div
              className="flex"
              animate={{ x: -currentIndex * 100 + '%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="w-full flex-shrink-0 cursor-pointer"
                  onClick={() => openModal(post)}
                >
                  <div className="bg-discord-dark rounded-lg p-4 mx-2">
                    <div className="aspect-square bg-gradient-to-br from-discord-accent to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">📸</div>
                        <div className="text-sm font-medium">{post.title}</div>
                      </div>
                    </div>
                    <p className="text-discord-muted text-sm text-center">Tap to view full post</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          {posts.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-discord-dark/80 hover:bg-discord-dark rounded-full flex items-center justify-center text-white transition-colors"
              >
                ←
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-discord-dark/80 hover:bg-discord-dark rounded-full flex items-center justify-center text-white transition-colors"
              >
                →
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {posts.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {posts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-discord-accent' : 'bg-discord-dark'
                  }`}
                  title={`Go to slide ${index + 1}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Grid (Alternative Layout) */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">All Posts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => openModal(post)}
                className="aspect-square bg-gradient-to-br from-discord-accent to-purple-600 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-center text-white">
                  <div className="text-2xl mb-1">📸</div>
                  <div className="text-xs font-medium">{post.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <HighlightModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
