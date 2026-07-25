'use client';

import React, { useState } from 'react';
import { VideoInfo } from '@/types/youtube';
import { formatDuration, formatViews } from '@/lib/youtube';
import FormatSelector from './FormatSelector';
import { Play, Clock, Eye, User, X } from 'lucide-react';
import Image from 'next/image';

interface VideoCardProps {
  info: VideoInfo;
}

export default function VideoCard({ info }: VideoCardProps) {
  const [isPlayingEmbed, setIsPlayingEmbed] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4 sm:px-6">
      {/* Embedded Video Modal */}
      {isPlayingEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <button
              onClick={() => setIsPlayingEmbed(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${info.videoId}?autoplay=1`}
                title={info.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Preview & Download Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Thumbnail Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden group bg-zinc-900 border border-white/10 shadow-lg">
              <Image
                src={info.thumbnail}
                alt={info.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              
              {/* Play Overlay Button */}
              <div 
                onClick={() => setIsPlayingEmbed(true)}
                className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/50 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>{formatDuration(info.duration)}</span>
              </div>
            </div>

            {/* Video Stats */}
            <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-red-500" />
                <span className="font-medium text-zinc-300 truncate max-w-[180px]">
                  {info.channelTitle || 'YouTube Creator'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                <span>{formatViews(info.viewCount)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title & Quality Selector */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug line-clamp-2">
                {info.title}
              </h2>
              <p className="text-xs text-zinc-400 mb-6 line-clamp-2">
                {info.description || 'No description available for this video.'}
              </p>
            </div>

            {/* Quality Format Selector Tabs */}
            <FormatSelector info={info} />
          </div>
        </div>
      </div>
    </div>
  );
}
