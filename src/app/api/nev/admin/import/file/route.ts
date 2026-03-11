import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save temp file
    const tempPath = join('/tmp', file.name);
    await writeFile(tempPath, buffer);
    
    const fileType = file.type;
    let data: any = {};

    if (fileType.includes('pdf')) {
      data = { type: 'pdf', message: 'PDF parsing not implemented yet' };
    } else if (fileType.includes('word') || fileType.includes('document')) {
      data = { type: 'doc', message: 'DOC parsing not implemented yet' };
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      data = { type: 'excel', message: 'Excel parsing not implemented yet' };
    } else if (fileType.includes('image')) {
      data = { type: 'image', message: 'Image parsing not implemented yet' };
    } else {
      data = { type: 'unknown', message: 'Unsupported file type' };
    }

    return NextResponse.json({
      source: 'file',
      filename: file.name,
      fileType,
      size: file.size,
      tempPath,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
