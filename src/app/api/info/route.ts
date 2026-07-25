import { NextResponse } from 'next/server';
import { YtdlCore } from '@ybd-project/ytdl-core';
import { extractVideoId } from '@/lib/youtube';

const ytdl = new YtdlCore({
  clients: ['android', 'ios', 'webCreator'],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url') || searchParams.get('v');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'YouTube URL parameter is required.' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL or Video ID.' },
        { status: 400 }
      );
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getFullInfo(targetUrl);
    const videoDetails = info.videoDetails;

    // Filter and map formats cleanly with resolution labels
    const formats = info.formats
      .map((f: any) => {
        const qualityLabel =
          typeof f.qualityLabel === 'string'
            ? f.qualityLabel
            : f.quality?.label || f.quality?.text || (f.hasAudio && !f.hasVideo ? 'Audio Only' : 'Standard Quality');

        const container = f.container || (f.mimeType?.includes('audio') ? 'mp3' : 'mp4');

        return {
          itag: f.itag,
          mimeType: f.mimeType || '',
          qualityLabel: qualityLabel,
          bitrate: f.bitrate,
          audioBitrate: f.audioBitrate,
          container: container,
          hasVideo: f.hasVideo ?? (f.mimeType?.includes('video') || false),
          hasAudio: f.hasAudio ?? (f.mimeType?.includes('audio') || false),
          contentLength: f.contentLength || undefined,
          quality: typeof f.quality === 'string' ? f.quality : (f.quality?.text || ''),
          url: f.url || undefined,
        };
      })
      .filter((f: any) => f.hasVideo || f.hasAudio);

    return NextResponse.json({
      videoId,
      title: videoDetails.title,
      description: videoDetails.description || '',
      thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      channelTitle: videoDetails.author?.name || 'YouTube Creator',
      channelUrl: (videoDetails.author as any)?.channelUrl || (videoDetails.author as any)?.channel_url || '',
      duration: parseInt(String(videoDetails.lengthSeconds || '0'), 10) || 0,
      viewCount: videoDetails.viewCount || '0',
      publishedAt: videoDetails.publishDate || '',
      formats,
    });
  } catch (err: unknown) {
    console.error('Info route error:', err);
    return NextResponse.json({ error: 'Unable to fetch video metadata from YouTube.' }, { status: 500 });
  }
}
