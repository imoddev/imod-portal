import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import {
  parsePDF,
  parseDOCX,
  parseExcel,
  extractSpecsWithAI,
  convertToWebP,
} from '@/lib/nev-import-helpers';

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
    let extractedText = '';

    if (fileType.includes('pdf')) {
      const pdfData = await parsePDF(tempPath);
      extractedText = pdfData.text;
      data = { type: 'pdf', numPages: pdfData.numPages, extractedText };
    } else if (fileType.includes('word') || fileType.includes('document')) {
      const docData = await parseDOCX(tempPath);
      extractedText = docData.text;
      data = { type: 'doc', extractedText };
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      const excelData = await parseExcel(tempPath);
      data = { type: 'excel', ...excelData };
    } else if (fileType.includes('image')) {
      const webpPath = tempPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      await convertToWebP(tempPath, webpPath);
      data = { type: 'image', webpPath, message: 'Image converted to WebP' };
    } else {
      data = { type: 'unknown', message: 'Unsupported file type' };
    }

    // Extract specs with AI if we have text
    if (extractedText) {
      const specs = await extractSpecsWithAI(extractedText);
      data.specs = specs;
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
