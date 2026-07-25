import { NextResponse } from 'next/server';
import { YtdlCore } from '@ybd-project/ytdl-core';
import ytdlDistube from '@distube/ytdl-core';
import { extractVideoId } from '@/lib/youtube';

const ytdl = new YtdlCore({
  clients: ['mweb', 'webCreator', 'android', 'ios'],
});

const PROXY_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://yewtu.be',
  'https://invidious.flokinet.to',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = extractVideoId(searchParams.get('v') || searchParams.get('url') || '');
    const itagParam = searchParams.get('itag') || '18';
    const customTitle = searchParams.get('title') || 'youtube_video';

    if (!videoId) {
      return NextResponse.json({ error: 'Valid Video ID is required.' }, { status: 400 });
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const sanitizedTitle = customTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudioOnly = itagParam === '140' || itagParam === '251' || itagParam === '249' || itagParam === '250';
    const container = isAudioOnly ? 'mp3' : 'mp4';
    const filename = `${sanitizedTitle || 'video'}.${container}`;
    const mimeType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';

    const rangeHeader = request.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    // TIER 1: Try YtdlCore formats
    try {
      const info = await ytdl.getFullInfo(targetUrl);
      const format = info.formats.find((f: any) => String(f.itag) === String(itagParam)) || info.formats.find((f: any) => f.hasVideo && f.hasAudio) || info.formats[0];

      if (format && format.url) {
        const cdnRes = await fetch(format.url, { headers: fetchHeaders });
        if (cdnRes.ok || cdnRes.status === 206) {
          const responseHeaders = new Headers();
          responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set('Content-Type', cdnRes.headers.get('content-type') || mimeType);
          responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

          if (cdnRes.headers.get('content-length')) {
            responseHeaders.set('Content-Length', cdnRes.headers.get('content-length')!);
          }
          if (cdnRes.headers.get('content-range')) {
            responseHeaders.set('Content-Range', cdnRes.headers.get('content-range')!);
          }
          responseHeaders.set('Accept-Ranges', 'bytes');

          return new NextResponse(cdnRes.body, {
            status: cdnRes.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        }
      }
    } catch (err) {
      console.warn('Tier 1 YtdlCore fetch warning:', err);
    }

    // TIER 2: Try @distube/ytdl-core formats
    try {
      const distubeInfo = await ytdlDistube.getInfo(targetUrl);
      const format = distubeInfo.formats.find((f) => String(f.itag) === String(itagParam)) || distubeInfo.formats.find((f) => f.hasVideo && f.hasAudio) || distubeInfo.formats[0];

      if (format && format.url) {
        const cdnRes = await fetch(format.url, { headers: fetchHeaders });
        if (cdnRes.ok || cdnRes.status === 206) {
          const responseHeaders = new Headers();
          responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set('Content-Type', cdnRes.headers.get('content-type') || mimeType);
          responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

          if (cdnRes.headers.get('content-length')) {
            responseHeaders.set('Content-Length', cdnRes.headers.get('content-length')!);
          }
          if (cdnRes.headers.get('content-range')) {
            responseHeaders.set('Content-Range', cdnRes.headers.get('content-range')!);
          }
          responseHeaders.set('Accept-Ranges', 'bytes');

          return new NextResponse(cdnRes.body, {
            status: cdnRes.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        }
      }
    } catch (err) {
      console.warn('Tier 2 Distube fetch warning:', err);
    }

    // TIER 3: Proxy Instances Pipeline
    for (const host of PROXY_INSTANCES) {
      try {
        const proxyUrl = `${host}/latest_version?id=${videoId}&itag=${itagParam}&local=true`;
        const proxyRes = await fetch(proxyUrl, { headers: fetchHeaders });

        if (proxyRes.ok || proxyRes.status === 206) {
          const responseHeaders = new Headers();
          responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
          responseHeaders.set('Content-Type', proxyRes.headers.get('content-type') || mimeType);

          if (proxyRes.headers.get('content-length')) {
            responseHeaders.set('Content-Length', proxyRes.headers.get('content-length')!);
          }
          responseHeaders.set('Accept-Ranges', 'bytes');

          return new NextResponse(proxyRes.body, {
            status: proxyRes.status === 206 ? 206 : 200,
            headers: responseHeaders,
          });
        }
      } catch (e) {
        console.warn(`Proxy host ${host} warning:`, e);
      }
    }

    // TIER 4: Fast Stream Fallback Redirect Response with direct stream info
    return NextResponse.json({
      error: 'Direct server fetch restricted by YouTube. Please use Fast Mirror Stream.',
      fallbackUrl: `https://yewtu.be/latest_version?id=${videoId}&itag=${itagParam}`,
    }, { status: 403 });
  } catch (err: unknown) {
    console.error('Download route catch error:', err);
    return NextResponse.json({ error: 'Failed to process YouTube download stream.' }, { status: 500 });
  }
}
