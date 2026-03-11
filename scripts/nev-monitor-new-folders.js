#!/usr/bin/env node
/**
 * NEV Monitor - Check for new folders and trigger Marcus-EV
 * Run via cron or manually
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ACTIVITY_FILE = '/Users/imodteam/Desktop/NEV-Database/Upload/activity.json';
const PROCESSED_FILE = '/Users/imodteam/Desktop/NEV-Database/Upload/processed-folders.json';

async function main() {
  console.log('[NEV Monitor] Checking for new folders...');
  
  // Read activity log
  if (!fs.existsSync(ACTIVITY_FILE)) {
    console.log('[NEV Monitor] No activity log found');
    return;
  }
  
  const activities = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
  
  // Read processed folders
  let processed = [];
  if (fs.existsSync(PROCESSED_FILE)) {
    processed = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
  }
  
  // Find new folders (status = pending_parse)
  const newFolders = activities.filter(a => 
    a.type === 'NEW_FOLDER' && 
    a.status === 'pending_parse' &&
    !processed.includes(a.folder)
  );
  
  console.log(`[NEV Monitor] Found ${newFolders.length} new folders`);
  
  for (const folder of newFolders) {
    console.log(`[NEV Monitor] Processing: ${folder.folder}`);
    
    // Trigger Marcus-EV via OpenClaw
    await triggerMarcusEV(folder);
    
    // Mark as processed
    processed.push(folder.folder);
    fs.writeFileSync(PROCESSED_FILE, JSON.stringify(processed, null, 2));
  }
  
  console.log('[NEV Monitor] Done');
}

async function triggerMarcusEV(activity) {
  return new Promise((resolve, reject) => {
    const task = `วิเคราะห์ข้อมูล NEV Database และนำเข้า Database

**โฟลเดอร์:** ${activity.folder}
**Path:** /Users/imodteam/Desktop/NEV-Database/Upload/${activity.folder}

**ข้อมูลที่มี:**
- แบรนด์: ${activity.brand || 'ยังไม่ระบุ'}
- รุ่น: ${activity.model || 'ยังไม่ระบุ'}
- รุ่นย่อย: ${activity.variant || 'ยังไม่ระบุ'}
- ไฟล์: ${activity.files} ไฟล์

**งานที่ต้องทำ:**

1. **อ่านไฟล์ทั้งหมด:**
   - PDF: Parse text และ extract specs
   - DOCX: Parse text และ extract specs
   - Images: OCR ถ้าจำเป็น

2. **Extract Specs ที่สำคัญ:**
   - ราคา (priceBaht)
   - แบตเตอรี่ (batteryKwh)
   - ระยะทาง (rangeKm)
   - มอเตอร์ (motorHp, torqueNm)
   - ความเร็ว (accel0100, topSpeedKmh)
   - ระบบขับเคลื่อน (drivetrain: FWD/RWD/AWD)
   - ชาร์จ DC (dcChargeKw, dcChargeMin)
   - ขนาด (lengthMm, widthMm, heightMm, wheelbaseMm)
   - น้ำหนัก (curbWeightKg)

3. **สร้าง merged.json:**
   - รวมข้อมูลจากทุกไฟล์
   - บันทึกไว้ในโฟลเดอร์เดียวกัน

4. **นำเข้า NEV Database:**
   - ใช้ Prisma client
   - สร้าง/อัปเดต Brand → Model → Variant
   - บันทึก specs ทั้งหมด

5. **แจ้งผล Discord:**
   - ส่งไปที่ #imoddrive (1467136835208609827)
   - แสดง: Brand, Model, Variant, ราคา, แบตเตอรี่, ระยะทาง
   - ลิงก์ไปยังหน้า variant

**กรุณารายงานผลทุกขั้นตอนและแจ้งเมื่อเสร็จสมบูรณ์**`;

    const cmd = `openclaw sessions spawn --runtime subagent --agent-id marcus-ev --mode run --task ${JSON.stringify(task)} --run-timeout-seconds 300`;
    
    console.log('[NEV Monitor] Triggering Marcus-EV...');
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[NEV Monitor] Error:', error);
        reject(error);
      } else {
        console.log('[NEV Monitor] Marcus-EV task spawned');
        resolve();
      }
    });
  });
}

// Run
main().catch(err => {
  console.error('[NEV Monitor] Fatal error:', err);
  process.exit(1);
});
