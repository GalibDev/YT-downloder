'use client';

import React, { useState } from 'react';
import { Search, Clipboard, X, Loader2, ArrowRight, Sparkles, Video, CheckCircle2 } from 'lucide-react';
import { extractVideoId } from '@/lib/youtube';

interface HeroSearchProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export default function HeroSearch({ onSearch, isLoading, error }: HeroSearchProps) {
  const [url, setUrl] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSearch(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        if (extractVideoId(text)) {
          onSearch(text.trim());
        }
      }
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch {
      // Clipboard access denied fallback
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    onSearch(exampleUrl);
  };

  return (
    <div className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Glow highlight effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Tagline */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold mb-6 shadow-inner animate-pulse-slow">
        <Sparkles className="w-4 h-4 text-red-400" />
        <span>100% Free • No Registration • Ultra Fast</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
        Download <span className="text-gradient-red">YouTube Videos</span> <br className="hidden sm:inline" /> & Audio in Seconds
      </h1>

      {/* Subtitle */}
      <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Paste any YouTube link, Short, or Video URL below to download in 
        <span className="text-zinc-200 font-semibold"> 1080p Full HD</span>, 
        <span className="text-zinc-200 font-semibold"> 720p HD</span>, or high quality 
        <span className="text-zinc-200 font-semibold"> MP3 Audio</span>.
      </p>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-6">
        <div className="glass-input rounded-2xl p-2 sm:p-3 flex items-center gap-2 transition-all duration-300 shadow-2xl">
          {/* Search / Video Icon */}
          <div className="pl-3 text-zinc-400 hidden sm:block">
            <Video className="w-6 h-6 text-red-500" />
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube video link here... (e.g. https://www.youtube.com/watch?v=...)"
            className="w-full bg-transparent px-3 py-3 text-white placeholder-zinc-500 text-sm sm:text-base outline-none border-none focus:ring-0"
            disabled={isLoading}
          />

          {/* Action Buttons inside Input */}
          <div className="flex items-center gap-2 pr-1">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Clear input"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              {copiedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Pasted!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4 text-zinc-400" />
                  <span>Paste</span>
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-5 sm:px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white font-bold text-sm sm:text-base flex items-center gap-2 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30 transition-all transform active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium animate-shake">
            {error}
          </div>
        )}
      </form>

      {/* Example links */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
        <span className="text-zinc-500 font-medium">Try example:</span>
        <button
          type="button"
          onClick={() => handleExampleClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-red-400 transition-colors"
        >
          Music Video Example
        </button>
        <button
          type="button"
          onClick={() => handleExampleClick('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-red-400 transition-colors"
        >
          First YouTube Video
        </button>
      </div>
    </div>
  );
}
