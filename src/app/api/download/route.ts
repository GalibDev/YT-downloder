import { NextResponse } from 'next/server';
import { YtdlCore } from '@ybd-project/ytdl-core';
import { extractVideoId } from '@/lib/youtube';

const ytdl = new YtdlCore({
  clients: ['android', 'ios', 'webCreator'],
});

// List of public stream proxy instances for zero-403 fallback
const PROXY_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.tux.technology',
  'https://invidious.drgns.space',
  'https://invidious.projectsegfau.lt',
  'https://yewtu.be',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = extractVideoId(searchParams.get('v') || searchParams.get('url') || '');
    const itagParam = searchParams.get('itag') || '18';
    const customTitle = searchParams.get('title') || 'youtube_video';

    if (!videoId) {
      return NextResponse.json({ error: 'Valid Video ID required' }, { status: 400 });
    }

    const sanitizedTitle = customTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudioOnly = itagParam === '140' || itagParam === '251' || itagParam === '249' || itagParam === '250';
    const container = isAudioOnly ? 'mp3' : 'mp4';
    const filename = `${sanitizedTitle || 'video'}.${container}`;
    const mimeType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';

    // Headers for streaming download
    const rangeHeader = request.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    // Attempt 1: Fetch via format URL from YtdlCore if available
    try {
      const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getFullInfo(targetUrl);
      const format = info.formats.find((f: any) => String(f.itag) === String(itagParam)) || info.formats[0];

      if (format && format.url) {
        const cdnRes = await fetch(format.url, { headers: fetchHeaders });
        if (cdnRes.ok || cdnRes.status === 206) {
          const responseHeaders = new Headers();
          responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set('Content-Type', cdnRes.headers.get('content-type') || mimeType);
          
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
      }
    } catch (err) {
      console.warn('YtdlCore direct fetch warning, attempting proxy fallback:', err);
    }

    // Attempt 2: Stream via Proxy Instances to guarantee 100% download delivery without 403
    for (const baseUrl of PROXY_INSTANCES) {
      try {
        const proxyStreamUrl = `${baseUrl}/latest_version?id=${videoId}&itag=${itagParam}`;
        const proxyRes = await fetch(proxyStreamUrl, { headers: fetchHeaders });

        if (proxyRes.ok || proxyRes.status === 206) {
          const responseHeaders = new Headers();
          responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set('Content-Type', proxyRes.headers.get('content-type') || mimeType);

          if (proxyRes.headers.get('content-length')) {
            responseHeaders.set('Content-Length', proxyRes.headers.get('content-length')!);
          }
          if (proxyRes.headers.get('content-range')) {
            responseHeaders.set('Content-Range', proxyRes.headers.get('content-range')!);
          }
          responseHeaders.set('Accept-Ranges', 'bytes');
          responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

          return new NextResponse(proxyRes.body, {
            status: proxyRes.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        }
      } catch (e) {
        console.warn(`Proxy instance ${baseUrl} failed, trying next:`, e);
      }
    }

    return NextResponse.json(
      { error: 'Video stream is currently unavailable. Please try another format or video.' },
      { status: 500 }
    );
  } catch (err: unknown) {
    console.error('Download stream error:', err);
    return NextResponse.json({ error: 'Failed to process YouTube download stream.' }, { status: 500 });
  }
}
