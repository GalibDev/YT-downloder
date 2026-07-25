'use client';

import React from 'react';
import { Youtube, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070709] py-12 px-4 sm:px-6 lg:px-8 text-zinc-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
            <Youtube className="w-5 h-5 fill-white" />
          </div>
          <span className="font-extrabold text-white text-base">
            YT<span className="text-red-500">Downloader</span> Pro
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-zinc-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">Terms of Service</span>
          <span className="text-zinc-500">Privacy Policy</span>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>using Next.js & Tailwind</span>
        </div>
      </div>
    </footer>
  );
}
