import sharp from 'sharp';
import { readFile } from 'fs/promises';

/**
 * Convert image to WebP
 */
export async function convertToWebP(
  inputPath: string,
  outputPath: string,
  quality: number = 80
): Promise<void> {
  await sharp(inputPath)
    .webp({ quality })
    .toFile(outputPath);
}

/**
 * Parse PDF with AI (GLM-5)
 */
export async function parsePDF(filePath: string): Promise<any> {
  const pdfParse = (await import('pdf-parse')) as any;
  const dataBuffer = await readFile(filePath);
  const data = await pdfParse(dataBuffer);
  
  return {
    text: data.text,
    numPages: data.numpages,
  };
}

/**
 * Parse DOCX
 */
export async function parseDOCX(filePath: string): Promise<any> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  
  return {
    text: result.value,
  };
}

/**
 * Parse Excel
 */
export async function parseExcel(filePath: string): Promise<any> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return {
    sheetName,
    data,
  };
}

/**
 * Extract vehicle specs with AI (GLM-5)
 */
export async function extractSpecsWithAI(text: string): Promise<any> {
  // Check API key
  if (!process.env.GLM_API_KEY) {
    console.warn('[Import] GLM_API_KEY not set');
    return { error: 'GLM API key not configured' };
  }
  
  // Truncate text if too long (max 10000 chars to avoid token limits)
  const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;
  
  try {
    // Call GLM-5 API to extract structured data
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
            content: `You are a vehicle specification extractor. Extract the following fields from the given text:
- brand: Brand name
- model: Model name
- variant: Variant name
- priceBaht: Price in Thai Baht (number)
- batteryKwh: Battery capacity in kWh (number)
- rangeKm: Range in kilometers (number)
- motorHp: Motor horsepower (number)
- torqueNm: Torque in Nm (number)
- accel0100: 0-100 km/h acceleration time in seconds (number)
- topSpeedKmh: Top speed in km/h (number)
- drivetrain: FWD, RWD, or AWD
- dcChargeKw: DC fast charging power in kW (number)
- dcChargeMin: DC charging time 10-80% in minutes (number)
- lengthMm: Length in mm (number)
- widthMm: Width in mm (number)
- heightMm: Height in mm (number)
- wheelbaseMm: Wheelbase in mm (number)
- curbWeightKg: Curb weight in kg (number)

Return ONLY a JSON object with these fields. Use null for missing values.`,
          },
          {
            role: 'user',
            content: truncatedText,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Import] GLM API error:', response.status, errorText);
      return { error: `GLM API error: ${response.status}` };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      return { error: 'No AI response' };
    }
    
    try {
      return JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code block
      const match = content.match(/```json\n([\s\S]+?)\n```/);
      if (match) {
        return JSON.parse(match[1]);
      }
      return { error: 'Failed to parse AI response' };
    }
  } catch (err: any) {
    console.error('[Import] extractSpecsWithAI error:', err);
    return { error: err.message || 'Unknown error' };
  }
}
