'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HighlightPost {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  html: string;
}

interface HighlightModalProps {
  post: HighlightPost;
  onClose: () => void;
}

export default function HighlightModal({ post, onClose }: HighlightModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for embedded content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [post]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-discord-darker rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-discord-dark">
            <h3 className="text-lg font-semibold text-white">{post.title}</h3>
            <button
              onClick={onClose}
              className="text-discord-muted hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-accent mx-auto mb-4"></div>
                  <p className="text-discord-muted">Loading post...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Instagram Embed Simulation */}
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      F
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">fitsitegonga</div>
                      <div className="text-sm text-gray-500">Fitness • Health</div>
                    </div>
                  </div>

                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">💪</div>
                      <div className="text-xl font-bold">Fitness Motivation</div>
                      <div className="text-sm opacity-90">Keep pushing forward!</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-semibold">2,847 likes</span>
                      <span>•</span>
                      <span>42 comments</span>
                    </div>

                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">fitsitegonga</span>
                      <span className="text-gray-900 ml-2">
                        Every workout is a step closer to your goals! 💪 Remember: consistency beats
                        perfection every time. #fitness #motivation #fitsitegonga
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-discord-accent text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    View on Instagram
                  </a>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-discord-dark text-discord-muted rounded-lg hover:bg-discord-medium hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
