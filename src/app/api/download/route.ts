import { NextResponse } from 'next/server';
import { YtdlCore } from '@ybd-project/ytdl-core';
import { extractVideoId } from '@/lib/youtube';

const ytdl = new YtdlCore({
  clients: ['android', 'ios', 'webCreator'],
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = extractVideoId(searchParams.get('v') || searchParams.get('url') || '');
    const itagParam = searchParams.get('itag');
    const customTitle = searchParams.get('title') || 'youtube_video';

    if (!videoId) {
      return NextResponse.json({ error: 'Valid Video ID required' }, { status: 400 });
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getFullInfo(targetUrl);

    let format: any;
    if (itagParam) {
      const itagNum = parseInt(itagParam, 10);
      format = info.formats.find((f: any) => f.itag === itagNum);
    }

    if (!format) {
      format = info.formats.find((f: any) => f.hasVideo && f.hasAudio) || info.formats[0];
    }

    if (!format) {
      return NextResponse.json({ error: 'Selected format stream unavailable' }, { status: 404 });
    }

    const sanitizedTitle = customTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudioOnly = !format.hasVideo && format.hasAudio;
    const container = format.container ? String(format.container) : (isAudioOnly ? 'mp3' : 'mp4');
    const filename = `${sanitizedTitle || 'video'}.${container}`;

    // Pass Range header if browser requests partial content / resumable download
    const rangeHeader = request.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    // Attempt direct CDN stream proxy
    if (format.url) {
      try {
        const cdnRes = await fetch(format.url, { headers: fetchHeaders });

        if (cdnRes.ok || cdnRes.status === 206) {
          const responseHeaders = new Headers();
          responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set('Content-Type', cdnRes.headers.get('content-type') || (isAudioOnly ? 'audio/mpeg' : 'video/mp4'));
          
          if (cdnRes.headers.get('content-length')) {
            responseHeaders.set('Content-Length', cdnRes.headers.get('content-length')!);
          }
          if (cdnRes.headers.get('content-range')) {
            responseHeaders.set('Content-Range', cdnRes.headers.get('content-range')!);
          }
          responseHeaders.set('Accept-Ranges', 'bytes');
          responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

          return new NextResponse(cdnRes.body, {
            status: cdnRes.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        }
      } catch (e) {
        console.warn('CDN fetch warning:', e);
      }
    }

    // Fallback redirect if CDN fetch receives 403
    if (format.url) {
      return NextResponse.redirect(format.url);
    }

    return NextResponse.json({ error: 'Download stream unavailable for this format.' }, { status: 500 });
  } catch (err: unknown) {
    console.error('Download stream error:', err);
    return NextResponse.json({ error: 'Failed to process YouTube download stream.' }, { status: 500 });
  }
}
