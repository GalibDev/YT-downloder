'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSearch from '@/components/HeroSearch';
import VideoCard from '@/components/VideoCard';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { VideoInfo } from '@/types/youtube';

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch YouTube video information.');
      }

      setVideoInfo(data);

      // Smooth scroll to video card
      setTimeout(() => {
        const videoElement = document.getElementById('video-result');
        if (videoElement) {
          videoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please check your URL and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-grid-pattern relative flex flex-col justify-between overflow-x-hidden">
      <div>
        {/* Navigation Bar */}
        <Navbar />

        {/* Hero & Search Section */}
        <HeroSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          error={error}
        />

        {/* Video Download Result Card */}
        {videoInfo && (
          <div id="video-result" className="scroll-mt-24">
            <VideoCard info={videoInfo} />
          </div>
        )}

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* FAQ Section */}
        <FAQ />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
