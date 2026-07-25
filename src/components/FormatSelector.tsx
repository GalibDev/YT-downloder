'use client';

import React, { useState } from 'react';
import { VideoInfo, FormatItem } from '@/types/youtube';
import { formatBytes } from '@/lib/youtube';
import { Download, Film, Music, Volume2, ShieldCheck, CheckCircle2, Loader2, AlertTriangle, Sparkles, ExternalLink, Zap, PlayCircle } from 'lucide-react';

interface FormatSelectorProps {
  info: VideoInfo;
}

export default function FormatSelector({ info }: FormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'hd'>('video');
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccessItag, setDownloadSuccessItag] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showEmbedEngine, setShowEmbedEngine] = useState<boolean>(false);

  // Filter formats into categories
  const videoFormats = info.formats.filter((f) => f.hasVideo && f.hasAudio);
  const videoOnlyFormats = info.formats.filter((f) => f.hasVideo && !f.hasAudio);
  const audioFormats = info.formats.filter((f) => !f.hasVideo && f.hasAudio);

  const getActiveFormats = (): FormatItem[] => {
    if (activeTab === 'video') {
      return videoFormats.length > 0 ? videoFormats : info.formats.filter((f) => f.hasVideo);
    }
    if (activeTab === 'audio') {
      return audioFormats.length > 0 ? audioFormats : info.formats.filter((f) => f.hasAudio);
    }
    if (activeTab === 'hd') {
      return videoOnlyFormats.length > 0 ? videoOnlyFormats : info.formats;
    }
    return info.formats;
  };

  const currentFormats = getActiveFormats();

  const handleDownload = async (format: FormatItem) => {
    setDownloadingItag(format.itag);
    setDownloadProgress(0);
    setDownloadSuccessItag(null);
    setDownloadError(null);

    const downloadUrl = `/api/download?v=${info.videoId}&itag=${format.itag}&title=${encodeURIComponent(info.title)}`;
    const sanitizedTitle = info.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudio = !format.hasVideo && format.hasAudio;
    const container = format.container || (isAudio ? 'mp3' : 'mp4');
    const fileName = `${sanitizedTitle || 'video'}.${container}`;

    try {
      const response = await fetch(downloadUrl);
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok || contentType.includes('json') || contentType.includes('html')) {
        let jsonErr: any = null;
        try { jsonErr = await response.json(); } catch {}

        setShowEmbedEngine(true);
        throw new Error(jsonErr?.error || 'YouTube server restriction detected. Using 1-Click HD Downloader Engine below.');
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      let loadedBytes = 0;

      if (!response.body) {
        throw new Error('Readable stream is not supported in this browser.');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          loadedBytes += value.length;
          if (totalBytes > 0) {
            const percent = Math.min(Math.round((loadedBytes / totalBytes) * 100), 99);
            setDownloadProgress(percent);
          }
        }
      }

      setDownloadProgress(100);
      const mimeType = contentType || (isAudio ? 'audio/mpeg' : 'video/mp4');
      const blob = new Blob(chunks as BlobPart[], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccessItag(format.itag);
      setTimeout(() => setDownloadSuccessItag(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed.';
      setDownloadError(msg);
    } finally {
      setDownloadingItag(null);
      setDownloadProgress(null);
    }
  };

  // SSYouTube & SaveFrom direct mirror links
  const ssYouTubeUrl = `https://ssyoutube.com/watch?v=${info.videoId}`;
  const loaderIframeUrl = `https://loader.to/api/card/?url=https://www.youtube.com/watch?v=${info.videoId}`;

  return (
    <div className="w-full space-y-6">
      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-xl">
        <button
          onClick={() => { setActiveTab('video'); setDownloadError(null); }}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'video'
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>🎬 Video (MP4)</span>
        </button>

        <button
          onClick={() => { setActiveTab('audio'); setDownloadError(null); }}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            activeTab === 'audio'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>🎵 Music (MP3)</span>
        </button>

        <button
          onClick={() => { setActiveTab('hd'); setDownloadError(null); }}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'hd'
              ? 'bg-zinc-800 text-white border border-white/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <span>HD (1080p/4K)</span>
        </button>
      </div>

      {/* 1-Click HD Downloader Embed Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <h4 className="font-extrabold text-white text-sm sm:text-base">1-Click Universal HD Downloader</h4>
          </div>
          <a
            href={ssYouTubeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow"
          >
            <span>SS YouTube Mirror</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-zinc-400">
          Downloads 1080p Full HD, 720p HD, 480p, 360p, and MP3 files directly to your device with 0 restrictions.
        </p>

        {/* Embedded Loader.to Downloader Iframe */}
        <div className="w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-inner">
          <iframe
            src={loaderIframeUrl}
            className="w-full h-[280px] sm:h-[220px] border-none"
            title="Universal HD Downloader"
          />
        </div>
      </div>

      {/* Error Alert Box */}
      {downloadError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{downloadError}</span>
          </div>
          <a
            href={ssYouTubeUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SS Mirror Download</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Title Header for active tab */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span>
            {activeTab === 'video' && 'Available Video Resolutions (MP4 + Audio)'}
            {activeTab === 'audio' && 'Available Music Tracks (MP3 / M4A)'}
            {activeTab === 'hd' && 'High-Definition Video Streams (1080p / 4K)'}
          </span>
        </h3>
        <span className="text-xs text-zinc-500 font-semibold">{currentFormats.length} Option(s)</span>
      </div>

      {/* Formats Grid */}
      {currentFormats.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-sm glass-card rounded-2xl p-6">
          No formats available for this tab. Switch to <strong>🎬 Video (MP4)</strong> or <strong>🎵 Music (MP3)</strong> above.
        </div>
      ) : (
        <div className="space-y-3">
          {currentFormats.map((item, idx) => {
            const isDownloading = downloadingItag === item.itag;
            const isSuccess = downloadSuccessItag === item.itag;
            const qualityDisplay = item.qualityLabel || item.quality || 'Standard Quality';
            const sizeDisplay = formatBytes(item.contentLength);
            const isRecommended = item.qualityLabel?.includes('720') || item.qualityLabel?.includes('360');

            return (
              <div
                key={`${item.itag}-${idx}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl transition-all gap-4 border ${
                  isRecommended
                    ? 'bg-red-500/[0.06] border-red-500/30 hover:bg-red-500/[0.1]'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                }`}
              >
                {/* Format Info */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                    item.hasVideo ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  }`}>
                    <span className="text-[10px] uppercase font-black">{item.container || (item.hasVideo ? 'MP4' : 'MP3')}</span>
                    <span>{item.qualityLabel?.replace('p', '') || 'HD'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base sm:text-lg">{qualityDisplay}</span>
                      {item.qualityLabel?.includes('720') && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-md shadow">
                          🔥 Best Quality
                        </span>
                      )}
                      {item.qualityLabel?.includes('360') && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                          ⚡ Fast Download
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>Size: <strong className="text-zinc-200">{sizeDisplay}</strong></span>
                      <span>•</span>
                      <span>Format: .{item.container || (item.hasVideo ? 'mp4' : 'mp3')}</span>
                      {item.audioBitrate && (
                        <>
                          <span>•</span>
                          <span>{item.audioBitrate} kbps Audio</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Download Action Buttons */}
                <div className="self-end sm:self-center w-full sm:w-auto flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={isDownloading}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : isDownloading
                        ? 'bg-zinc-800 text-white border border-red-500/50 cursor-wait'
                        : activeTab === 'audio'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-600/30'
                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-600/30'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                        <span>Downloaded!</span>
                      </>
                    ) : isDownloading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        <span>
                          {downloadProgress !== null
                            ? `Downloading... ${downloadProgress}%`
                            : 'Starting...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>
                          {activeTab === 'audio' ? 'Download MP3' : `Download ${qualityDisplay}`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* SSYouTube Direct Mirror Link */}
                  <a
                    href={ssYouTubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="SS YouTube Direct Mirror Download"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Guaranteed Download • Universal HD Engine Integrated</span>
      </div>
    </div>
  );
}
