import { NextRequest, NextResponse } from 'next/server';

// ✅ Use environment variable for flexibility (Vercel vs Local)
const ACTIVITY_API_URL = process.env.MAC_STUDIO_IMPORT_URL 
  ? `${process.env.MAC_STUDIO_IMPORT_URL}/nev/activity`
  : null;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // If running on Vercel (no local file access), try to fetch from Mac Studio
    if (ACTIVITY_API_URL) {
      try {
        const res = await fetch(`${ACTIVITY_API_URL}?limit=${limit}`, {
          next: { revalidate: 30 }, // Cache for 30 seconds
        });
        if (res.ok) {
          const data = await res.json();
          // Return array for frontend compatibility
          return NextResponse.json(data.activities || []);
        }
      } catch {
        // Mac Studio not reachable, return empty
      }
    }
    
    // Fallback: return empty array (Vercel can't read local files)
    return NextResponse.json([]);
  } catch (error: any) {
    console.error('[Activity API] Error:', error);
    // Return empty array instead of error object
    return NextResponse.json([]);
  }
}
