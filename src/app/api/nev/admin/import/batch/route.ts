import { NextRequest, NextResponse } from 'next/server';

const MAC_STUDIO_URL = process.env.MAC_STUDIO_IMPORT_URL || 'http://localhost:3200';

export async function POST(request: NextRequest) {
  try {
    console.log('[Batch Import] Starting batch import via Mac Studio...');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    console.log('[Batch Import] Received files:', files.length);
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }
    
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files allowed' }, { status: 400 });
    }
    
    // Check total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (totalSize > maxSize) {
      return NextResponse.json({ 
        error: `Total file size too large (${(totalSize / 1024 / 1024).toFixed(1)} MB). Maximum 50 MB allowed.` 
      }, { status: 400 });
    }

    // Create new FormData for Mac Studio
    const macStudioFormData = new FormData();
    const batchId = `batch-${Date.now()}`;
    
    macStudioFormData.append('batchId', batchId);
    macStudioFormData.append('userId', 'vercel-upload');
    
    // Add all files
    for (const file of files) {
      macStudioFormData.append('files', file);
    }
    
    console.log('[Batch Import] Forwarding to Mac Studio:', MAC_STUDIO_URL);
    
    // Forward to Mac Studio
    const response = await fetch(`${MAC_STUDIO_URL}/nev/import`, {
      method: 'POST',
      body: macStudioFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Batch Import] Mac Studio error:', response.status, errorText);
      return NextResponse.json({
        error: 'Failed to forward files to Mac Studio',
        details: errorText.substring(0, 200),
      }, { status: 500 });
    }
    
    const result = await response.json();
    console.log('[Batch Import] Mac Studio response:', result);
    
    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      fileCount: files.length,
      message: 'ไฟล์อัปโหลดสำเร็จ! AI Agent บน Mac Studio กำลังประมวลผล...',
      macStudioResponse: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Batch Import] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch', details: error.message },
      { status: 500 }
    );
  }
}
