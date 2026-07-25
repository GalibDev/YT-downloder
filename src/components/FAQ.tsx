'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is downloading YouTube videos using this site free?",
      a: "Yes! YT Downloader is 100% free with unlimited downloads. You do not need an account or subscription to use it."
    },
    {
      q: "What video resolutions are supported?",
      a: "We support downloading in 1080p Full HD, 720p HD, 480p, 360p, and 240p resolutions, as well as MP3 audio extraction."
    },
    {
      q: "Can I download YouTube Shorts and MP3 songs?",
      a: "Absolutely! Just paste any YouTube Shorts or video link, select the Audio MP3 tab or Video tab, and click Download."
    },
    {
      q: "Does this downloader work on Android and iPhone?",
      a: "Yes, our web app is fully responsive and compatible with mobile devices, tablets, and desktop browsers (Chrome, Safari, Firefox, Edge)."
    },
    {
      q: "Where are the downloaded files saved on my device?",
      a: "Files are automatically saved into your browser's default 'Downloads' folder (or prompt location if customized)."
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/5">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Got Questions?</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-white text-base hover:text-red-400 transition-colors gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-500' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
