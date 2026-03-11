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
    console.log('[Batch Import] Starting batch import...');
    
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
    console.log('[Batch Import] Parsing files...');
    const parsedData: any[] = [];
    
    for (let i = 0; i < savedFiles.length; i++) {
      const file = savedFiles[i];
      console.log(`[Batch Import] Parsing file ${i + 1}/${savedFiles.length}: ${file.name}`);
      
      let extractedText = '';
      let fileData: any = { success: false };

      try {
        if (file.type.includes('pdf')) {
          // PDF parsing disabled (not supported on Vercel serverless)
          fileData = { 
            type: 'pdf', 
            error: 'PDF parsing not supported on serverless. Please use DOC/DOCX/XLS/Images instead.',
            success: false 
          };
        } else if (file.type.includes('word') || file.type.includes('document')) {
          const docData = await parseDOCX(file.path);
          extractedText = docData.text;
          fileData = { type: 'doc', success: true };
        } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
          const excelData = await parseExcel(file.path);
          fileData = { type: 'excel', data: excelData, success: true };
        } else if (file.type.includes('image')) {
          const webpPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          await convertToWebP(file.path, webpPath);
          fileData = { type: 'image', webpPath, success: true };
        } else {
          fileData = { type: 'unknown', error: 'Unsupported file type', success: false };
        }

        // Extract specs with AI if we have text
        if (extractedText && extractedText.length > 50) {
          console.log(`[Batch Import] Extracting specs from ${file.name}...`);
          const specs = await extractSpecsWithAI(extractedText);
          fileData.specs = specs;
          fileData.extractedText = extractedText.substring(0, 500); // First 500 chars for preview
        }
      } catch (parseError: any) {
        console.error(`[Batch Import] Error parsing ${file.name}:`, parseError);
        fileData.error = parseError.message || 'Parse error';
        fileData.success = false;
      }

      parsedData.push({
        filename: file.name,
        ...fileData,
      });
    }
    
    console.log('[Batch Import] Parsed files:', parsedData.length);

    // Step 3: Combine all extracted specs
    const allSpecs = parsedData
      .filter(d => d.specs && d.success)
      .map(d => d.specs);
    
    console.log('[Batch Import] Extracted specs from files:', allSpecs.length);

    // Step 4: AI analyze combined data
    let finalSpecs: any = {};
    let mergeError: string | null = null;
    
    if (allSpecs.length > 0) {
      try {
        console.log('[Batch Import] Merging specs with AI...');
        finalSpecs = await analyzeAndMergeSpecs(allSpecs);
        console.log('[Batch Import] Merge successful');
      } catch (mergeErr: any) {
        console.error('[Batch Import] Merge error:', mergeErr);
        mergeError = mergeErr.message || 'Failed to merge specs';
        // Fallback: use first spec if merge fails
        finalSpecs = allSpecs[0] || {};
      }
    } else {
      mergeError = 'No specs extracted from files';
    }

    const successCount = parsedData.filter(d => d.success).length;
    const failCount = parsedData.filter(d => !d.success).length;
    
    console.log('[Batch Import] Complete:', { successCount, failCount });
    
    return NextResponse.json({
      source: 'batch',
      batchId: `batch-${timestamp}`,
      fileCount: files.length,
      successCount,
      failCount,
      batchDir,
      parsedData,
      mergeError,
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
  // Check API key
  if (!process.env.GLM_API_KEY) {
    console.warn('[Batch Import] GLM_API_KEY not set, using simple merge');
    // Fallback: simple merge (first spec wins)
    return specs[0] || {};
  }
  
  console.log('[Batch Import] Calling GLM-5 API...');
  
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Batch Import] GLM API error:', response.status, errorText);
    throw new Error(`GLM API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const result = await response.json();
  console.log('[Batch Import] GLM API response received');
  
  const content = result.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No AI response content');
  }
  
  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code block
    const match = content.match(/```json\n([\s\S]+?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    console.error('[Batch Import] Failed to parse AI response:', content.substring(0, 500));
    throw new Error('Failed to parse AI response');
  }
}
