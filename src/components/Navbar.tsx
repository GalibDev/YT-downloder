'use client';

import React from 'react';
import { Youtube, Zap, Shield, Sparkles } from 'lucide-react';

export default function Navbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
            <Youtube className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-red-400 transition-colors">
                YT<span className="text-red-500">Downloader</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-full uppercase tracking-wider shadow-sm">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Fast, Free & Unlimited</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <button 
            onClick={() => scrollTo('features')} 
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-red-500" /> Features
          </button>
          <button 
            onClick={() => scrollTo('how-it-works')} 
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-amber-400" /> How It Works
          </button>
          <button 
            onClick={() => scrollTo('faq')} 
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-emerald-400" /> FAQ
          </button>
        </nav>

        {/* Speed Indicator Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Server Active • High Speed</span>
          </div>
        </div>
      </div>
    </header>
  );
}
