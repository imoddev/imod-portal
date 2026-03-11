import { NextRequest, NextResponse } from 'next/server';

const MAC_STUDIO_URL = process.env.MAC_STUDIO_IMPORT_URL || 'http://localhost:3200';

export async function GET(request: NextRequest) {
  try {
    // Forward to Mac Studio
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '20';
    
    let url = `${MAC_STUDIO_URL}/nev/activity?limit=${limit}`;
    if (type) url += `&type=${type}`;
    
    console.log('[Activity API] Forwarding to Mac Studio:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Activity API] Mac Studio error:', response.status, errorText);
      return NextResponse.json({
        error: 'Failed to fetch from Mac Studio',
        details: errorText,
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Activity API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log', details: error.message },
      { status: 500 }
    );
  }
}
