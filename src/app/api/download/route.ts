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
      return NextResponse.json({ error: 'Unable to fetch video info from YouTube.' }, { status: 500 });
    }

    // List candidate formats: 1st priority: exact requested itag; 2nd priority: progressive formats (video+audio); 3rd priority: audio formats
    const candidateFormats: ytdl.videoFormat[] = [];

    if (itagParam) {
      const itagNum = parseInt(itagParam, 10);
      const requested = info.formats.find((f) => f.itag === itagNum);
      if (requested) candidateFormats.push(requested);
    }

    // Add progressive formats (360p itag 18, 720p itag 22, etc.)
    const progressive = info.formats.filter((f) => f.hasVideo && f.hasAudio && f.url);
    candidateFormats.push(...progressive);

    // Add audio formats (itag 140, etc.)
    const audioOnly = info.formats.filter((f) => !f.hasVideo && f.hasAudio && f.url);
    candidateFormats.push(...audioOnly);

    // Fallback: any format with URL
    const anyFormats = info.formats.filter((f) => f.url);
    candidateFormats.push(...anyFormats);

    const sanitizedTitle = customTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const rangeHeader = request.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    // Try candidate formats in order until one streams successfully
    for (const fmt of candidateFormats) {
      if (!fmt.url) continue;

      try {
        const cdnRes = await fetch(fmt.url, { headers: fetchHeaders });

        if (cdnRes.ok || cdnRes.status === 206) {
          const isAudioOnly = !fmt.hasVideo && fmt.hasAudio;
          const container = fmt.container ? String(fmt.container) : (isAudioOnly ? 'mp3' : 'mp4');
          const filename = `${sanitizedTitle || 'video'}.${container}`;
          const mimeType = fmt.mimeType?.split(';')[0] || (isAudioOnly ? 'audio/mpeg' : 'video/mp4');

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
        }
      } catch (e) {
        console.warn(`Format itag ${fmt.itag} fetch warning:`, e);
      }
    }

    return NextResponse.json(
      { error: 'All stream candidates are currently restricted by YouTube. Please try another video.' },
      { status: 502 }
    );
  } catch (err: unknown) {
    console.error('Download route catch error:', err);
    return NextResponse.json({ error: 'Failed to process YouTube download stream.' }, { status: 500 });
  }
}
