'use client';

import React from 'react';
import { Copy, Search, Download, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <Copy className="w-6 h-6 text-red-500" />,
      title: "Copy Video URL",
      description: "Copy the YouTube video or Shorts link from your browser address bar or mobile share menu."
    },
    {
      step: "02",
      icon: <Search className="w-6 h-6 text-amber-500" />,
      title: "Paste & Convert",
      description: "Paste the link into the search bar above and click Download to parse video formats."
    },
    {
      step: "03",
      icon: <Download className="w-6 h-6 text-emerald-500" />,
      title: "Save File",
      description: "Choose your preferred quality (1080p, 720p, or MP3) and click Download to save."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How To Download in 3 Easy Steps
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
          No signups, no complicated settings. Get your favorite media files in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, idx) => (
          <div key={idx} className="relative glass-card rounded-2xl p-8 border border-white/10 text-center flex flex-col items-center">
            <span className="absolute top-4 right-6 text-4xl font-black text-white/5">
              {item.step}
            </span>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{item.description}</p>

            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-zinc-600">
                <ArrowRight className="w-6 h-6" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
