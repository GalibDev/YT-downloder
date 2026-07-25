import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import { extractVideoId } from '@/lib/youtube';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = extractVideoId(searchParams.get('v') || searchParams.get('url') || '');
    const itagParam = searchParams.get('itag');
    const customTitle = searchParams.get('title') || 'youtube_video';

    if (!videoId) {
      return NextResponse.json({ error: 'Valid Video ID is required.' }, { status: 400 });
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Get video info using ytdl-core
    let info;
    try {
      info = await ytdl.getInfo(targetUrl, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
        },
      });
    } catch (e) {
      console.error('ytdl.getInfo error in download route:', e);
      return NextResponse.json({ error: 'Unable to fetch video formats from YouTube.' }, { status: 500 });
    }

    let format;
    if (itagParam) {
      const itagNum = parseInt(itagParam, 10);
      format = info.formats.find((f) => f.itag === itagNum);
    }

    // Default to progressive format or audio format
    if (!format) {
      format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    }

    if (!format || !format.url) {
      return NextResponse.json({ error: 'Selected format stream is currently unavailable.' }, { status: 404 });
    }

    const sanitizedTitle = customTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudioOnly = !format.hasVideo && format.hasAudio;
    const container = format.container ? String(format.container) : (isAudioOnly ? 'mp3' : 'mp4');
    const filename = `${sanitizedTitle || 'video'}.${container}`;
    const mimeType = format.mimeType?.split(';')[0] || (isAudioOnly ? 'audio/mpeg' : 'video/mp4');

    // Range header support for browser stream download
    const rangeHeader = request.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    // Direct proxy fetch from YouTube CDN
    const cdnRes = await fetch(format.url, { headers: fetchHeaders });

    if (!cdnRes.ok && cdnRes.status !== 206) {
      console.warn(`CDN fetch status ${cdnRes.status} for itag ${format.itag}`);
      return NextResponse.json(
        { error: 'YouTube stream link returned access restriction. Try another format.' },
        { status: 502 }
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    responseHeaders.set('Content-Type', mimeType);
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
  } catch (err: unknown) {
    console.error('Download route catch error:', err);
    return NextResponse.json({ error: 'Failed to process YouTube download stream.' }, { status: 500 });
  }
}
