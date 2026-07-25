'use client';

import React, { useState } from 'react';
import { VideoInfo, FormatItem } from '@/types/youtube';
import { formatBytes } from '@/lib/youtube';
import { Download, Film, Music, Volume2, ShieldCheck, CheckCircle2, Loader2, AlertTriangle, Sparkles, Star } from 'lucide-react';

interface FormatSelectorProps {
  info: VideoInfo;
}

export default function FormatSelector({ info }: FormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'video-only'>('video');
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccessItag, setDownloadSuccessItag] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Filter video formats (progressive: has video & audio) and audio formats separately
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
    if (activeTab === 'video-only') {
      return videoOnlyFormats;
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
        let errorMsg = 'Selected format stream is restricted. Falling back to alternative format...';
        try {
          const jsonErr = await response.json();
          if (jsonErr?.error) errorMsg = jsonErr.error;
        } catch {}
        throw new Error(errorMsg);
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

      if (loadedBytes < 50000 && !isAudio) {
        throw new Error('Downloaded file size is too small. Please select 720p or 360p for instant full video download.');
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
    } fontally: {
      setDownloadingItag(null);
      setDownloadProgress(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Category Selection Tabs */}
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
          onClick={() => { setActiveTab('video-only'); setDownloadError(null); }}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === 'video-only'
              ? 'bg-zinc-800 text-white border border-white/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <span>HD (1080p/4K)</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {downloadError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm font-medium flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Info Tip */}
      <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-300">
        <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
        <span><strong>Tip:</strong> For fastest download with audio, select <strong>720p HD</strong> or <strong>360p</strong> under the <strong>🎬 Video (MP4)</strong> tab!</span>
      </div>

      {/* Title Header for active tab */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span>
            {activeTab === 'video' && 'Available Full Video Resolutions (MP4 + Audio)'}
            {activeTab === 'audio' && 'Available High-Quality Music Tracks (MP3 / M4A)'}
            {activeTab === 'video-only' && 'High-Definition Adaptive Streams (1080p / 4K)'}
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
                          🔥 Best Quality (Fast)
                        </span>
                      )}
                      {item.qualityLabel?.includes('360') && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md">
                          ⚡ Ultra Fast
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

                {/* Download Action Button */}
                <div className="self-end sm:self-center w-full sm:w-auto">
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
                        <span>Downloaded Successfully!</span>
                      </>
                    ) : isDownloading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        <span>
                          {downloadProgress !== null
                            ? `Downloading... ${downloadProgress}%`
                            : 'Starting Download...'}
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

                  {/* Progress bar */}
                  {isDownloading && downloadProgress !== null && (
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Safe & Encrypted Download • Instant File Delivery</span>
      </div>
    </div>
  );
}
