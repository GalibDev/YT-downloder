'use client';

import React, { useState } from 'react';
import { VideoInfo, ActiveTab, FormatItem } from '@/types/youtube';
import { formatBytes } from '@/lib/youtube';
import { Download, Film, Music, Volume2, ShieldCheck, CheckCircle2, Loader2, Sparkles, ChevronDown } from 'lucide-react';

interface FormatSelectorProps {
  info: VideoInfo;
}

export default function FormatSelector({ info }: FormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('video');
  const [selectedItag, setSelectedItag] = useState<number | null>(null);
  const [downloadingItag, setDownloadingItag] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccessItag, setDownloadSuccessItag] = useState<number | null>(null);

  // Filter formats based on selected tab
  const getFilteredFormats = (): FormatItem[] => {
    if (!info.formats || info.formats.length === 0) return [];

    if (activeTab === 'video') {
      const list = info.formats.filter((f) => f.hasVideo && f.hasAudio);
      if (list.length > 0) return list;
      return info.formats.filter((f) => f.hasVideo);
    }

    if (activeTab === 'video-only') {
      return info.formats.filter((f) => f.hasVideo && !f.hasAudio);
    }

    if (activeTab === 'audio') {
      return info.formats.filter((f) => !f.hasVideo && f.hasAudio);
    }

    return info.formats;
  };

  const formats = getFilteredFormats();
  const currentSelectedFormat = formats.find(f => f.itag === selectedItag) || formats[0];

  const handleDownload = async (format: FormatItem) => {
    setDownloadingItag(format.itag);
    setDownloadProgress(0);
    setDownloadSuccessItag(null);

    const downloadUrl = `/api/download?v=${info.videoId}&itag=${format.itag}&title=${encodeURIComponent(info.title)}`;
    const sanitizedTitle = info.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudio = !format.hasVideo && format.hasAudio;
    const container = format.container || (isAudio ? 'mp3' : 'mp4');
    const fileName = `${sanitizedTitle || 'video'}.${container}`;

    try {
      // Stream fetch with client-side progress tracking
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Server download failed');
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      let loadedBytes = 0;

      if (!response.body) {
        throw new Error('Readable stream not supported');
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

      // Assemble blob and trigger browser file save
      setDownloadProgress(100);
      const mimeType = response.headers.get('content-type') || (isAudio ? 'audio/mpeg' : 'video/mp4');
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
    } catch (err) {
      console.warn('Client blob fetch failed, falling back to direct location download:', err);
      // Fallback: Trigger direct browser download
      window.location.href = downloadUrl;
    } finally {
      setDownloadingItag(null);
      setDownloadProgress(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Format Category Tabs */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => { setActiveTab('video'); setSelectedItag(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'video'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Video + Sound</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">Recommended</span>
        </button>

        <button
          onClick={() => { setActiveTab('audio'); setSelectedItag(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'audio'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Audio MP3 / M4A</span>
        </button>

        <button
          onClick={() => { setActiveTab('video-only'); setSelectedItag(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'video-only'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Volume2 className="w-4 h-4 text-zinc-400" />
          <span>Video Only (1080p/4K)</span>
        </button>
      </div>

      {/* Resolution Quick Selector Dropdown */}
      {formats.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-white/10 bg-white/[0.02]">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Select Resolution Quality:</span>
          </label>
          <div className="relative">
            <select
              value={currentSelectedFormat?.itag || ''}
              onChange={(e) => setSelectedItag(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-white/20 text-white rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-red-500 font-bold text-sm sm:text-base cursor-pointer"
            >
              {formats.map((f, idx) => (
                <option key={`${f.itag}-${idx}`} value={f.itag} className="bg-zinc-900 text-white py-2">
                  {f.qualityLabel || f.quality || 'Standard Quality'} (.{f.container || 'mp4'}) - {formatBytes(f.contentLength)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Formats Table / Grid */}
      {formats.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-sm">
          No streams available for this category. Try switching tabs.
        </div>
      ) : (
        <div className="space-y-3">
          {formats.map((item, idx) => {
            const isDownloading = downloadingItag === item.itag;
            const isSuccess = downloadSuccessItag === item.itag;
            const qualityDisplay = item.qualityLabel || item.quality || 'Standard Quality';
            const sizeDisplay = formatBytes(item.contentLength);

            return (
              <div
                key={`${item.itag}-${idx}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all gap-3 ${
                  selectedItag === item.itag
                    ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/10'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                }`}
              >
                {/* Format Details */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex flex-col items-center justify-center font-bold text-xs text-zinc-200 shrink-0">
                    <span className="text-red-400 text-[10px] uppercase font-extrabold">{item.container || 'MP4'}</span>
                    <span>{item.qualityLabel?.replace('p', '') || 'HD'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base sm:text-lg">{qualityDisplay}</span>
                      {item.qualityLabel?.includes('1080') && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-md">
                          1080p FHD
                        </span>
                      )}
                      {item.qualityLabel?.includes('720') && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                          720p HD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>Size: <strong className="text-zinc-200">{sizeDisplay}</strong></span>
                      <span>•</span>
                      <span>Format: .{item.container || 'mp4'}</span>
                      {item.audioBitrate && (
                        <>
                          <span>•</span>
                          <span>{item.audioBitrate} kbps</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Download Button & Progress */}
                <div className="self-end sm:self-center w-full sm:w-auto">
                  <button
                    onClick={() => { setSelectedItag(item.itag); handleDownload(item); }}
                    disabled={isDownloading}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : isDownloading
                        ? 'bg-zinc-800 text-white cursor-wait border border-red-500/50'
                        : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/30'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                        <span>Downloaded Successfully!</span>
                      </>
                    ) : isDownloading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        <span>
                          {downloadProgress !== null
                            ? `Downloading... ${downloadProgress}%`
                            : 'Starting Download...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download {qualityDisplay}</span>
                      </>
                    )}
                  </button>

                  {/* Progress Bar under button when downloading */}
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
        <span>Safe & Fast Download Engine • 100% Virus Free</span>
      </div>
    </div>
  );
}
