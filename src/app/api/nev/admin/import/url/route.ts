import { NextRequest, NextResponse } from 'next/server';

const MAC_STUDIO_URL = 'http://localhost:3200';

/**
 * POST /api/nev/admin/import/url
 * 
 * Import NEV data from a URL (PDF, website, Google Sheets, etc.)
 * Forwards to Mac Studio server for processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('[NEV URL Import] Forwarding to Mac Studio:', url);

    // Forward to Mac Studio
    const response = await fetch(`${MAC_STUDIO_URL}/nev/import-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[NEV URL Import] Mac Studio error:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to process URL',
          details: data.details 
        },
        { status: response.status }
      );
    }

    console.log('[NEV URL Import] Success:', data);

    return NextResponse.json({
      success: true,
      message: data.message || 'URL received. Processing...',
      batchId: data.batchId,
      ...data,
    });

  } catch (error: any) {
    console.error('[NEV URL Import] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
