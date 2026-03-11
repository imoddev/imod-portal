import { NextRequest, NextResponse } from 'next/server';

const MAC_STUDIO_URL = process.env.MAC_STUDIO_IMPORT_URL || 'http://localhost:3200';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Try to fetch folders from Mac Studio
    try {
      const res = await fetch(`${MAC_STUDIO_URL}/nev/folders?limit=${limit}`, {
        next: { revalidate: 30 }, // Cache for 30 seconds
      });
      
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data.folders || []);
      }
    } catch {
      // Mac Studio not reachable
    }
    
    // Fallback: return empty array
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('[Folders API] Error:', error);
    return NextResponse.json([]);
  }
}
