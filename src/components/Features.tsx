'use client';

import React from 'react';
import { Zap, ShieldCheck, DownloadCloud, Music, Sparkles, Smartphone } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      icon: <Zap className="w-6 h-6 text-red-500" />,
      title: "Lightning Fast Speed",
      description: "Direct high-bandwidth download links for instant video & audio conversion with zero delay."
    },
    {
      icon: <DownloadCloud className="w-6 h-6 text-amber-500" />,
      title: "1080p & 4K HD Quality",
      description: "Download videos in crystal clear 1080p Full HD, 720p HD, and 60fps resolutions."
    },
    {
      icon: <Music className="w-6 h-6 text-emerald-500" />,
      title: "YouTube to MP3 Audio",
      description: "Extract pure high bitrate audio (320kbps / 256kbps MP3) from any music video or podcast."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      title: "100% Safe & Secure",
      description: "No malware, no software installation required. Clean browser-based downloading."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-purple-500" />,
      title: "All Devices Supported",
      description: "Works flawlessly on Windows, Mac, Android, iPhone, iPad, and all web browsers."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-500" />,
      title: "Unlimited & Free",
      description: "No subscription fees or download limits. Download as many videos as you want."
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4">
          <Sparkles className="w-4 h-4 text-red-400" />
          <span>Why Choose YT Downloader</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Supercharge Your Media Downloads
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
          Everything you need for seamless YouTube video and audio downloading in one clean interface.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuresList.map((feature, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
