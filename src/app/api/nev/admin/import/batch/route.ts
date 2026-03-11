import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  parsePDF,
  parseDOCX,
  parseExcel,
  extractSpecsWithAI,
  convertToWebP,
} from '@/lib/nev-import-helpers';

const TEMP_DIR = '/tmp/nev-import';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }
    
    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 files allowed' }, { status: 400 });
    }

    // Create temp directory with timestamp
    const timestamp = Date.now();
    const batchDir = join(TEMP_DIR, `batch-${timestamp}`);
    
    if (!existsSync(batchDir)) {
      await mkdir(batchDir, { recursive: true });
    }

    // Step 1: Save all files
    const savedFiles: { path: string; name: string; type: string }[] = [];
    
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(batchDir, file.name);
      
      await writeFile(filePath, buffer);
      savedFiles.push({
        path: filePath,
        name: file.name,
        type: file.type,
      });
    }

    // Step 2: Parse each file
    const parsedData: any[] = [];
    
    for (const file of savedFiles) {
      let extractedText = '';
      let fileData: any = {};

      if (file.type.includes('pdf')) {
        const pdfData = await parsePDF(file.path);
        extractedText = pdfData.text;
        fileData = { type: 'pdf', numPages: pdfData.numPages };
      } else if (file.type.includes('word') || file.type.includes('document')) {
        const docData = await parseDOCX(file.path);
        extractedText = docData.text;
        fileData = { type: 'doc' };
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
        const excelData = await parseExcel(file.path);
        fileData = { type: 'excel', data: excelData };
      } else if (file.type.includes('image')) {
        const webpPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        await convertToWebP(file.path, webpPath);
        fileData = { type: 'image', webpPath };
      }

      // Extract specs with AI if we have text
      if (extractedText) {
        const specs = await extractSpecsWithAI(extractedText);
        fileData.specs = specs;
        fileData.extractedText = extractedText.substring(0, 500); // First 500 chars for preview
      }

      parsedData.push({
        filename: file.name,
        ...fileData,
      });
    }

    // Step 3: Combine all extracted specs
    const allSpecs = parsedData
      .filter(d => d.specs)
      .map(d => d.specs);

    // Step 4: AI analyze combined data
    let finalSpecs: any = {};
    
    if (allSpecs.length > 0) {
      // Merge specs intelligently
      finalSpecs = await analyzeAndMergeSpecs(allSpecs);
    }

    return NextResponse.json({
      source: 'batch',
      batchId: `batch-${timestamp}`,
      fileCount: files.length,
      batchDir,
      parsedData,
      data: {
        specs: finalSpecs,
        individualSpecs: allSpecs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    return NextResponse.json(
      { error: 'Failed to process batch', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Analyze and merge multiple spec objects with AI
 */
async function analyzeAndMergeSpecs(specs: any[]): Promise<any> {
  // Call GLM-5 to intelligently merge specs
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        {
          role: 'system',
          content: `You are a vehicle specification data analyst. You receive multiple extracted spec objects from different sources (brochures, spec sheets, images, etc.). Your task is to:

1. Identify the vehicle (brand, model, variant)
2. Merge and consolidate all specs into ONE complete object
3. Resolve conflicts (take the most specific/detailed value)
4. Fill missing fields with null

Return ONLY a JSON object with these fields:
- brand, model, variant
- priceBaht, batteryKwh, rangeKm, motorHp, torqueNm
- accel0100, topSpeedKmh, drivetrain
- dcChargeKw, dcChargeMin
- lengthMm, widthMm, heightMm, wheelbaseMm, curbWeightKg`,
        },
        {
          role: 'user',
          content: `Analyze and merge these specs:\n\n${JSON.stringify(specs, null, 2)}`,
        },
      ],
      temperature: 0.1,
    }),
  });

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No AI response');
  }
  
  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code block
    const match = content.match(/```json\n([\s\S]+?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('Failed to parse AI response');
  }
}
