/**
  * Validate and extract YouTube Video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  const trimmed = url.trim();

  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(watchRegex);
  
  if (match && match[1]) {
    return match[1];
  }

  // Check if user just pasted a raw 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = mins.toString().padStart(2, '0');
  const paddedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const paddedHrs = hrs.toString().padStart(2, '0');
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Format view count numbers (e.g. 1.2M views, 450K views)
 */
export function formatViews(views: string | number): string {
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return '0 views';

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B views';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M views';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K views';
  }
  return num.toLocaleString() + ' views';
}

/**
 * Format bytes to readable size (MB, GB)
 */
export function formatBytes(bytes?: string | number): string {
  if (!bytes) return 'Unknown size';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return 'Unknown size';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));

  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
