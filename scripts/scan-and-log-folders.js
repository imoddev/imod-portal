#!/usr/bin/env node
/**
 * Scan NEV Upload folder and create activity log
 */

const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/Users/imodteam/Desktop/NEV-Database/Upload';
const ACTIVITY_FILE = path.join(UPLOAD_DIR, 'activity.json');

function scanFolders() {
  console.log('📂 Scanning folders...\n');
  
  // Read existing activity log
  let activities = [];
  if (fs.existsSync(ACTIVITY_FILE)) {
    activities = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
  }
  
  // Get all folders
  const folders = fs.readdirSync(UPLOAD_DIR)
    .filter(f => fs.statSync(path.join(UPLOAD_DIR, f)).isDirectory())
    .filter(f => !f.startsWith('.'));
  
  console.log(`Found ${folders.length} folders total`);
  console.log(`Existing logs: ${activities.length}\n`);
  
  let newCount = 0;
  
  for (const folder of folders) {
    // Check if already logged
    const exists = activities.find(a => a.folder === folder);
    if (exists) {
      console.log(`✓ ${folder} (already logged)`);
      continue;
    }
    
    // Parse folder name to extract brand/model
    const folderPath = path.join(UPLOAD_DIR, folder);
    const files = fs.readdirSync(folderPath)
      .filter(f => !f.startsWith('.') && !f.endsWith('.json'));
    
    const stats = files.map(f => fs.statSync(path.join(folderPath, f)));
    const totalSize = stats.reduce((sum, s) => sum + s.size, 0);
    
    // Try to parse folder name
    let brand = null;
    let model = null;
    
    // Format: YYYY-MM-DD Brand Model
    const match = folder.match(/^\d{4}-\d{2}-\d{2}\s+(.+)$/);
    if (match) {
      const parts = match[1].split(/\s+/);
      if (parts.length >= 2) {
        brand = parts[0];
        model = parts.slice(1).join(' ');
      } else {
        brand = match[1];
      }
    }
    
    // Create activity log
    const activity = {
      type: 'NEW_FOLDER',
      folder: folder,
      timestamp: new Date().toISOString(),
      files: files.length,
      totalSize: totalSize,
      brand: brand,
      model: model,
      variant: null,
      status: 'pending_parse'
    };
    
    activities.unshift(activity); // Add to front
    newCount++;
    
    console.log(`+ ${folder}`);
    console.log(`  Brand: ${brand || 'Unknown'}`);
    console.log(`  Model: ${model || 'Unknown'}`);
    console.log(`  Files: ${files.length}`);
    console.log('');
  }
  
  // Keep last 100 activities
  if (activities.length > 100) {
    activities = activities.slice(0, 100);
  }
  
  // Save
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activities, null, 2));
  
  console.log(`\n✅ Done! Added ${newCount} new folders`);
  console.log(`Total activities: ${activities.length}`);
}

scanFolders();
