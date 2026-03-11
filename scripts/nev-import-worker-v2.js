#!/usr/bin/env node
/**
 * NEV Import Worker V2 - Simplified
 * Delegates AI processing to Marcus-EV, sends Discord notification when done
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const UPLOAD_DIR = '/Users/imodteam/Desktop/NEV-Database/Upload';
const DISCORD_CHANNEL_ID = '1467136835208609827'; // #imoddrive
const DISCORD_NOTIFY_ID = '1478707742603612241'; // Notify user

// Get batchId from command line
const batchId = process.argv[2];

if (!batchId) {
  console.error('Usage: node nev-import-worker-v2.js <batchId>');
  process.exit(1);
}

async function main() {
  console.log(`[Worker V2] Processing batch: ${batchId}`);
  
  const batchDir = path.join(UPLOAD_DIR, batchId);
  const metadataPath = path.join(batchDir, 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    console.error(`[Worker V2] Metadata not found: ${metadataPath}`);
    process.exit(1);
  }
  
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  
  console.log(`[Worker V2] Found ${metadata.fileCount} files`);
  console.log(`[Worker V2] Brand: ${metadata.manualInfo.brand || 'auto'}`);
  console.log(`[Worker V2] Model: ${metadata.manualInfo.model || 'auto'}`);
  
  // Update status
  metadata.status = 'processing';
  metadata.processedAt = new Date().toISOString();
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Send Discord notification
  await sendDiscordNotification(metadata);
  
  console.log(`[Worker V2] Batch ${batchId} notification sent!`);
  
  // Update status to completed
  metadata.status = 'pending_parse';
  metadata.workerCompletedAt = new Date().toISOString();
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

async function sendDiscordNotification(metadata) {
  return new Promise((resolve, reject) => {
    const brand = metadata.manualInfo.brand || 'ยังไม่ระบุ';
    const model = metadata.manualInfo.model || 'ยังไม่ระบุ';
    const variant = metadata.manualInfo.variant || 'ยังไม่ระบุ';
    
    const message = `🚗 **[New] ${metadata.batchId}**

📦 ไฟล์: ${metadata.fileCount} ไฟล์
🏢 แบรนด์: ${brand}
🚙 รุ่น: ${model}
⭐ รุ่นย่อย: ${variant}

⏳ รอ Marcus-EV parse ข้อมูล...

<@${DISCORD_NOTIFY_ID}>`;

    const cmd = `openclaw message send --channel discord --to "channel:${DISCORD_CHANNEL_ID}" --message ${JSON.stringify(message)}`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[Worker V2] Discord error:', error);
        reject(error);
      } else {
        console.log('[Worker V2] Discord notification sent');
        resolve();
      }
    });
  });
}

// Run
main().catch(err => {
  console.error('[Worker V2] Fatal error:', err);
  process.exit(1);
});
