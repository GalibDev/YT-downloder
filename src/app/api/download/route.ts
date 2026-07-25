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
      return NextResponse.json({ error: 'Valid Video ID required' }, { status: 400 });
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(targetUrl, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      },
    });

    let format;
    if (itagParam) {
      const itagNum = parseInt(itagParam, 10);
      format = info.formats.find((f) => f.itag === itagNum);
    }

    // Default to progressive format or highest quality available
    if (!format) {
      format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    }

    if (!format) {
      return NextResponse.json({ error: 'Selected format stream unavailable' }, { status: 404 });
    }

    // Clean up filename for Content-Disposition
    const sanitizedTitle = customTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const isAudioOnly = !format.hasVideo && format.hasAudio;
    const container = format.container ? String(format.container) : (isAudioOnly ? 'mp3' : 'mp4');
    const filename = `${sanitizedTitle || 'video'}.${container}`;

    let responseStream: ReadableStream | null = null;
    let streamContentLength: string | undefined = format.contentLength;
    let streamMimeType = format.mimeType?.split(';')[0] || (isAudioOnly ? 'audio/mpeg' : 'video/mp4');

    // Strategy 1: Fetch directly from Google CDN with YouTube Referer to prevent 403
    if (format.url) {
      try {
        const cdnRes = await fetch(format.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://www.youtube.com/',
            'Origin': 'https://www.youtube.com',
          },
        });

        if (cdnRes.ok && cdnRes.body) {
          responseStream = cdnRes.body;
          if (cdnRes.headers.get('content-length')) {
            streamContentLength = cdnRes.headers.get('content-length')!;
          }
          if (cdnRes.headers.get('content-type')) {
            streamMimeType = cdnRes.headers.get('content-type')!.split(';')[0];
          }
        }
      } catch (e) {
        console.warn('CDN fetch warning, falling back to ytdl stream:', e);
      }
    }

    // Strategy 2: Fallback to ytdl decipher stream
    if (!responseStream) {
      const ytdlStream = ytdl.downloadFromInfo(info, {
        format,
        highWaterMark: 1 << 25,
      });

      responseStream = new ReadableStream({
        start(controller) {
          ytdlStream.on('data', (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          ytdlStream.on('end', () => {
            try { controller.close(); } catch {}
          });
          ytdlStream.on('error', (err: Error) => {
            console.error('ytdl inner error:', err);
            try { controller.error(err); } catch {}
          });
        },
        cancel() {
          ytdlStream.destroy();
        }
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    responseHeaders.set('Content-Type', streamMimeType);
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Disposition');

    if (streamContentLength) {
      responseHeaders.set('Content-Length', streamContentLength);
    }

    return new NextResponse(responseStream, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    console.error('Download stream error:', err);
    return NextResponse.json({ error: 'Failed to process YouTube download stream.' }, { status: 500 });
  }
}
