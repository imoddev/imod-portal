#!/usr/bin/env node
/**
 * NEV Import Worker - AI Processing
 * Processes uploaded files, extracts specs with AI, saves to database
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const UPLOAD_DIR = '/tmp/nev-import';
const DISCORD_CHANNEL_ID = '1467136835208609827'; // #imoddrive
const MARCUS_EV_SESSION = 'workspace-marcus-ev'; // Marcus-EV workspace

// Get batchId from command line
const batchId = process.argv[2];

// Discord helpers
async function createDiscordThread(metadata) {
  const axios = require('axios');
  const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:3030';
  const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;
  
  try {
    // Use message tool to create thread in #imoddrive
    const response = await axios.post(`${GATEWAY_URL}/api/v1/message/send`, {
      channel: 'discord',
      action: 'thread-create',
      channelId: DISCORD_CHANNEL_ID,
      threadName: `🚗 NEV Import: ${metadata.batchId}`,
      message: `**NEV Database Import**\n\nBatch ID: \`${metadata.batchId}\`\nไฟล์: ${metadata.fileCount} ไฟล์\nขนาดรวม: ${formatSize(metadata.totalSize)}\n\n⏳ กำลังเริ่มประมวลผล...`
    }, {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const threadId = response.data?.result?.threadId;
    console.log(`[Worker] Discord thread created in #imoddrive: ${threadId}`);
    return threadId;
  } catch (err) {
    console.error('[Worker] Failed to create thread:', err.message);
    return null;
  }
}

async function sendProgress(threadId, step, details) {
  if (!threadId) return;
  
  const axios = require('axios');
  const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:3030';
  const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;
  
  try {
    await axios.post(`${GATEWAY_URL}/api/v1/message/send`, {
      channel: 'discord',
      threadId,
      message: `${step}\n${details}`
    }, {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('[Worker] Failed to send progress:', err.message);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

if (!batchId) {
  console.error('Usage: node nev-import-worker.js <batchId>');
  process.exit(1);
}

async function main() {
  console.log(`[Worker] Processing batch: ${batchId}`);
  
  const batchDir = path.join(UPLOAD_DIR, batchId);
  const metadataPath = path.join(batchDir, 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    console.error(`[Worker] Metadata not found: ${metadataPath}`);
    process.exit(1);
  }
  
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  
  console.log(`[Worker] Found ${metadata.fileCount} files`);
  
  // Create Discord thread
  const threadId = await createDiscordThread(metadata);
  metadata.discordThreadId = threadId;
  
  // Update status
  metadata.status = 'processing';
  metadata.processedAt = new Date().toISOString();
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Progress: Step 1 - Upload complete
  await sendProgress(threadId, '✅ 1/6 อัปโหลดไฟล์เสร็จ', `📦 ${metadata.fileCount} ไฟล์ (${formatSize(metadata.totalSize)})`);
  
  // Progress: Step 2 - Parsing files
  await sendProgress(threadId, '🔄 2/6 กำลัง parse ไฟล์...', `ประมวลผล ${metadata.fileCount} ไฟล์`);
  
  // Process each file
  const results = [];
  
  for (let i = 0; i < metadata.files.length; i++) {
    const file = metadata.files[i];
    console.log(`[Worker] Processing: ${file.name} (${i + 1}/${metadata.files.length})`);
    
    await sendProgress(
      threadId, 
      `🔄 2/6 กำลัง parse ไฟล์ (${i + 1}/${metadata.files.length})`,
      `📄 ${file.name}`
    );
    
    try {
      const result = await processFile(file);
      results.push(result);
    } catch (err) {
      console.error(`[Worker] Error processing ${file.name}:`, err);
      results.push({
        filename: file.name,
        success: false,
        error: err.message
      });
    }
  }
  
  // Extract and merge specs
  const allSpecs = results.filter(r => r.success && r.specs).map(r => r.specs);
  
  console.log(`[Worker] Extracted specs from ${allSpecs.length}/${metadata.fileCount} files`);
  
  // Progress: Step 3 - AI Extract
  await sendProgress(
    threadId,
    '✅ 3/6 AI extract specs เสร็จ',
    `🤖 ดึงข้อมูลจาก ${allSpecs.length}/${metadata.fileCount} ไฟล์สำเร็จ`
  );
  
  let finalSpecs = null;
  let variant = null;
  
  if (allSpecs.length > 0) {
    // Progress: Step 4 - Merge
    await sendProgress(
      threadId,
      '🔄 4/6 กำลัง merge specs...',
      `รวมข้อมูลจาก ${allSpecs.length} ไฟล์`
    );
    
    // Merge specs with AI
    finalSpecs = await mergeSpecsWithAI(allSpecs);
    
    await sendProgress(
      threadId,
      '✅ 4/6 Merge specs เสร็จ',
      `✨ ${finalSpecs.brand || ''} ${finalSpecs.model || ''} ${finalSpecs.variant || ''}`
    );
    
    // Progress: Step 5 - Save database
    await sendProgress(
      threadId,
      '🔄 5/6 กำลังบันทึกลง database...',
      '💾 สร้าง brand/model/variant'
    );
    
    // Save to database
    variant = await saveToDatabase(finalSpecs);
    
    await sendProgress(
      threadId,
      '✅ 5/6 บันทึก database เสร็จ',
      `📝 ${variant.fullName}`
    );
    
    console.log(`[Worker] Saved variant: ${variant.fullName} (${variant.id})`);
  }
  
  // Update metadata
  metadata.status = 'completed';
  metadata.completedAt = new Date().toISOString();
  metadata.results = results;
  metadata.finalSpecs = finalSpecs;
  metadata.variantId = variant?.id || null;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Progress: Step 6 - Done
  if (variant) {
    const duration = Math.round((new Date() - new Date(metadata.timestamp)) / 1000);
    await sendProgress(
      threadId,
      '✅ 6/6 เสร็จสิ้น!',
      `🎉 Import สำเร็จ (ใช้เวลา ${duration} วินาที)\n\n🚗 **${variant.fullName}**\n💰 ราคา: ${variant.priceBaht ? `฿${variant.priceBaht.toLocaleString('th-TH')}` : '-'}\n🔋 แบตเตอรี่: ${variant.batteryKwh ? `${variant.batteryKwh} kWh` : '-'}\n📏 ระยะทาง: ${variant.rangeKm ? `${variant.rangeKm} km` : '-'}\n\n🔗 ดูรายละเอียด: https://imod-portal.vercel.app/nev/admin/variants/${variant.id}`
    );
  } else {
    await sendProgress(
      threadId,
      '⚠️ Import ไม่สำเร็จ',
      `ไม่สามารถ extract specs ได้\nตรวจสอบไฟล์และลองใหม่อีกครั้ง`
    );
  }
  
  console.log(`[Worker] Batch ${batchId} completed!`);
  
  await prisma.$disconnect();
}

async function processFile(file) {
  // Import helpers
  const {
    parsePDF,
    parseDOCX,
    parseExcel,
    extractSpecsWithAI,
    convertToWebP
  } = require('../src/lib/nev-import-helpers');
  
  let extractedText = '';
  let fileData = { filename: file.name, success: false };
  
  try {
    if (file.mimetype.includes('pdf')) {
      const pdfData = await parsePDF(file.path);
      extractedText = pdfData.text;
      fileData.type = 'pdf';
      fileData.numPages = pdfData.numPages;
      fileData.success = true;
    } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
      const docData = await parseDOCX(file.path);
      extractedText = docData.text;
      fileData.type = 'doc';
      fileData.success = true;
    } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
      const excelData = await parseExcel(file.path);
      fileData.type = 'excel';
      fileData.data = excelData;
      fileData.success = true;
    } else if (file.mimetype.includes('image')) {
      const webpPath = file.path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      await convertToWebP(file.path, webpPath);
      fileData.type = 'image';
      fileData.webpPath = webpPath;
      fileData.success = true;
    }
    
    // Extract specs with AI if we have text
    if (extractedText && extractedText.length > 50) {
      const specs = await extractSpecsWithAI(extractedText);
      fileData.specs = specs;
    }
  } catch (err) {
    fileData.error = err.message;
    fileData.success = false;
  }
  
  return fileData;
}

async function mergeSpecsWithAI(specs) {
  // Simple merge for now (take first non-null value)
  // TODO: Use GLM-5 for intelligent merge
  const merged = {};
  
  const fields = [
    'brand', 'model', 'variant',
    'priceBaht', 'batteryKwh', 'rangeKm', 'motorHp', 'torqueNm',
    'accel0100', 'topSpeedKmh', 'drivetrain',
    'dcChargeKw', 'dcChargeMin',
    'lengthMm', 'widthMm', 'heightMm', 'wheelbaseMm', 'curbWeightKg'
  ];
  
  for (const field of fields) {
    for (const spec of specs) {
      if (spec[field] != null) {
        merged[field] = spec[field];
        break;
      }
    }
  }
  
  return merged;
}

function slugify(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function saveToDatabase(specs) {
  if (!specs.brand || !specs.model) {
    throw new Error('Brand and model are required');
  }
  
  // Find or create brand
  let brand = await prisma.nevBrand.findFirst({
    where: { slug: slugify(specs.brand) }
  });
  
  if (!brand) {
    brand = await prisma.nevBrand.create({
      data: {
        name: specs.brand,
        slug: slugify(specs.brand)
      }
    });
  }
  
  // Find or create model
  let model = await prisma.nevModel.findFirst({
    where: {
      brandId: brand.id,
      slug: slugify(`${specs.brand}-${specs.model}`)
    }
  });
  
  if (!model) {
    model = await prisma.nevModel.create({
      data: {
        brandId: brand.id,
        name: specs.model,
        slug: slugify(`${specs.brand}-${specs.model}`),
        fullName: `${specs.brand} ${specs.model}`,
        powertrain: 'BEV',
        year: new Date().getFullYear()
      }
    });
  }
  
  // Create variant
  const variant = await prisma.nevVariant.create({
    data: {
      modelId: model.id,
      name: specs.variant || 'Standard',
      fullName: `${specs.brand} ${specs.model} ${specs.variant || 'Standard'}`,
      slug: slugify(`${specs.brand}-${specs.model}-${specs.variant || 'standard'}`),
      priceBaht: specs.priceBaht,
      batteryKwh: specs.batteryKwh,
      rangeKm: specs.rangeKm,
      motorHp: specs.motorHp,
      torqueNm: specs.torqueNm,
      accel0100: specs.accel0100,
      topSpeedKmh: specs.topSpeedKmh,
      drivetrain: specs.drivetrain,
      dcChargeKw: specs.dcChargeKw,
      dcChargeMin: specs.dcChargeMin,
      lengthMm: specs.lengthMm,
      widthMm: specs.widthMm,
      heightMm: specs.heightMm,
      wheelbaseMm: specs.wheelbaseMm,
      curbWeightKg: specs.curbWeightKg,
      dataSource: 'import-batch'
    }
  });
  
  return variant;
}

// Discord notification removed - using thread progress updates instead

// Run
main().catch(err => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});
