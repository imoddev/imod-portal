#!/usr/bin/env node
/**
 * NEV Import Server - Mac Studio
 * Receives files from Vercel, saves to Desktop, triggers AI processing
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3200; // NEV Import Server port

// Create upload directory
const UPLOAD_DIR = '/Users/imodteam/Desktop/NEV-Database/Upload';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Generate folder name: YYYY-MM-DD-BRAND-Model-SubModel or YYYY-MM-DD-batch-{timestamp}
function generateFolderName(brand, model, variant) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (brand && model) {
    const parts = [date, brand, model];
    if (variant) parts.push(variant);
    // Clean filename: remove special chars except hyphen
    return parts.join('-').replace(/[^a-zA-Z0-9-]/g, '-');
  }
  
  // Fallback: date + timestamp
  return `${date}-batch-${Date.now()}`;
}

// Multer storage config (simple - rename after upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use temp folder first
    const tempBatchId = `temp-${Date.now()}`;
    const tempDir = path.join(UPLOAD_DIR, tempBatchId);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Store in req for later
    req.tempBatchId = tempBatchId;
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file
});

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'NEV Import Server',
    uptime: process.uptime(),
    uploadDir: UPLOAD_DIR
  });
});

// Import endpoint (receives files from Vercel)
app.post('/nev/import', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    const tempBatchId = req.tempBatchId;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    console.log(`[NEV Import] Received ${files.length} files`);
    console.log(`[NEV Import] Manual info: brand="${req.body.brand}" model="${req.body.model}" variant="${req.body.variant}"`);
    
    const tempDir = path.join(UPLOAD_DIR, tempBatchId);
    
    // Generate final folder name
    const brand = req.body.brand || '';
    const model = req.body.model || '';
    const variant = req.body.variant || '';
    const finalBatchId = generateFolderName(brand, model, variant);
    const finalDir = path.join(UPLOAD_DIR, finalBatchId);
    
    // Rename temp folder → final folder
    console.log(`[NEV Import] Renaming: ${tempBatchId} → ${finalBatchId}`);
    fs.renameSync(tempDir, finalDir);
    
    // Create metadata file
    const metadata = {
      batchId: finalBatchId,
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      files: files.map(f => ({
        name: f.originalname,
        size: f.size,
        path: f.path.replace(tempBatchId, finalBatchId),
        mimetype: f.mimetype
      })),
      // Manual info
      manualInfo: {
        brand: brand || null,
        model: model || null,
        variant: variant || null
      },
      status: 'pending',
      uploadedBy: req.body.userId || 'vercel-upload',
      discordChannelId: '1467136835208609827', // #imoddrive
      discordThreadId: null
    };
    
    fs.writeFileSync(
      path.join(finalDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`[NEV Import] Metadata saved: ${finalDir}/metadata.json`);
    
    // Trigger AI worker (async)
    triggerAIWorker(finalBatchId).catch(err => {
      console.error(`[NEV Import] Worker error:`, err);
    });
    
    res.json({
      success: true,
      batchId: finalBatchId,
      fileCount: files.length,
      message: 'ไฟล์อัปโหลดสำเร็จ! AI Agent กำลังประมวลผล...',
      batchDir: finalDir
    });
  } catch (err) {
    console.error('[NEV Import] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Trigger AI Worker
function triggerAIWorker(batchId) {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, 'nev-import-worker.js');
    const cmd = `node ${workerPath} ${batchId}`;
    
    console.log(`[NEV Import] Triggering worker: ${cmd}`);
    
    const child = exec(cmd);
    
    child.stdout.on('data', data => {
      console.log(`[NEV Import] Worker stdout: ${data.trim()}`);
    });
    
    child.stderr.on('data', data => {
      console.error(`[NEV Import] Worker stderr: ${data.trim()}`);
    });
    
    child.on('error', err => {
      console.error('[NEV Import] Worker error:', err);
      reject(err);
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`[NEV Import] Worker completed: ${batchId}`);
        resolve();
      } else {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NEV Import Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`✅ Ready to receive files from Vercel`);
});
