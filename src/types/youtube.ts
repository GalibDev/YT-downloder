export interface FormatItem {
  itag: number;
  mimeType: string;
  qualityLabel?: string;
  bitrate?: number;
  audioBitrate?: number;
  container: string;
  hasVideo: boolean;
  hasAudio: boolean;
  contentLength?: string;
  quality: string;
  url?: string;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelUrl: string;
  duration: number; // in seconds
  viewCount: string;
  publishedAt: string;
  formats: FormatItem[];
}

export type ActiveTab = 'video' | 'video-only' | 'audio';
