#!/usr/bin/env node
/**
 * NEV Import Helpers (Pure Node.js - no TypeScript)
 * Used by nev-import-worker.js
 */

const fs = require('fs');

/**
 * Parse PDF (placeholder - pdf-parse causes issues)
 */
async function parsePDF(filePath) {
  // PDF parsing disabled for now - recommend DOC/DOCX
  return {
    text: '',
    numPages: 0,
    error: 'PDF parsing not available in worker context'
  };
}

/**
 * Parse DOCX
 */
async function parseDOCX(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  
  return {
    text: result.value
  };
}

/**
 * Parse Excel
 */
async function parseExcel(filePath) {
  const XLSX = require('xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return {
    sheetName,
    data
  };
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath, outputPath, quality = 80) {
  const sharp = require('sharp');
  await sharp(inputPath)
    .webp({ quality })
    .toFile(outputPath);
}

/**
 * Extract vehicle specs with AI (GLM-5)
 */
async function extractSpecsWithAI(text) {
  // Check API key
  if (!process.env.GLM_API_KEY) {
    console.warn('[Import] GLM_API_KEY not set');
    return { error: 'GLM API key not configured' };
  }
  
  // Truncate text if too long
  const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;
  
  try {
    const axios = require('axios');
    
    const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
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

Return ONLY a JSON object with these fields. Use null for missing values.`
        },
        {
          role: 'user',
          content: truncatedText
        }
      ],
      temperature: 0.1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`
      }
    });

    const content = response.data?.choices?.[0]?.message?.content;
    
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
  } catch (err) {
    console.error('[Import] extractSpecsWithAI error:', err);
    return { error: err.message || 'Unknown error' };
  }
}

module.exports = {
  parsePDF,
  parseDOCX,
  parseExcel,
  convertToWebP,
  extractSpecsWithAI
};
