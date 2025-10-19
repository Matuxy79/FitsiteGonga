'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HighlightCarousel from '@/components/highlights/HighlightCarousel';

interface HighlightPost {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  html: string;
}

export default function HighlightsPage() {
  const [posts, setPosts] = useState<HighlightPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      // Mock Instagram post URLs - in production, these would come from your Instagram API
      const mockPosts: HighlightPost[] = [
        {
          id: '1',
          url: 'https://instagram.com/p/mock1',
          title: 'Workout Motivation',
          thumbnail: '',
          html: '',
        },
        {
          id: '2',
          url: 'https://instagram.com/p/mock2',
          title: 'Nutrition Tips',
          thumbnail: '',
          html: '',
        },
        {
          id: '3',
          url: 'https://instagram.com/p/mock3',
          title: 'Form Check',
          thumbnail: '',
          html: '',
        },
        {
          id: '4',
          url: 'https://instagram.com/p/mock4',
          title: 'Progress Update',
          thumbnail: '',
          html: '',
        },
      ];

      // In a real implementation, you would fetch oEmbed data for each post
      // const postsWithEmbed = await Promise.all(
      //   mockPosts.map(async (post) => {
      //     const response = await fetch(`/api/instagram?url=${encodeURIComponent(post.url)}`);
      //     const embedData = await response.json();
      //     return { ...post, ...embedData };
      //   })
      // );

      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading highlights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-discord-darker rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Instagram Highlights</h1>
        <p className="text-discord-muted">
          Latest fitness content and inspiration from our community
        </p>
      </div>

      {/* Highlights Carousel */}
      <HighlightCarousel posts={posts} />

      {/* Instagram Integration Info */}
      <div className="bg-discord-darker rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <span className="text-discord-warning text-lg">ℹ️</span>
          <div>
            <h3 className="text-sm font-medium text-discord-warning mb-2">Instagram Integration</h3>
            <div className="text-sm text-discord-muted space-y-2">
              <p>
                This feature displays recent posts from @fitsitegonga. In a production environment,
                this would integrate with Instagram&apos;s Basic Display API to show real content.
              </p>
              <p>
                Currently showing mock data for demonstration purposes. The carousel and modal
                functionality are fully implemented and ready for real Instagram integration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Follow @fitsitegonga</h2>
        <p className="text-blue-100 mb-4">
          Get daily fitness tips, workout inspiration, and community updates
        </p>
        <a
          href="https://instagram.com/fitsitegonga"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <span className="mr-2">📸</span>
          Follow on Instagram
        </a>
      </div>
    </div>
  );
}
