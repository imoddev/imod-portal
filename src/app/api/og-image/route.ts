import { NextResponse } from 'next/server';

/**
 * GET /api/og-image?url=https://...
 * ดึง Open Graph image จาก URL
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; iMoD Portal Bot/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 400 });
    }

    const html = await response.text();

    // Extract OG image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    
    // Extract OG title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
                         html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    // Extract OG description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    
    let favicon = faviconMatch?.[1];
    if (favicon && !favicon.startsWith('http')) {
      const urlObj = new URL(url);
      favicon = favicon.startsWith('/') 
        ? `${urlObj.origin}${favicon}`
        : `${urlObj.origin}/${favicon}`;
    }

    return NextResponse.json({
      url,
      ogImage: ogImageMatch?.[1] || null,
      ogTitle: ogTitleMatch?.[1] || null,
      ogDescription: ogDescMatch?.[1] || null,
      favicon: favicon || `${new URL(url).origin}/favicon.ico`,
    });
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return NextResponse.json({ error: 'Failed to fetch OG data' }, { status: 500 });
  }
}
