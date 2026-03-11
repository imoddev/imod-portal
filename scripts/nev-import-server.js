#!/usr/bin/env node
/**
 * NEV Import Server - Mac Studio
 * Receives files from Vercel, saves to /tmp, triggers AI processing
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3200; // NEV Import Server port

// Create upload directory
const UPLOAD_DIR = '/tmp/nev-import';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const batchId = req.body.batchId || `batch-${Date.now()}`;
    const batchDir = path.join(UPLOAD_DIR, batchId);
    
    if (!fs.existsSync(batchDir)) {
      fs.mkdirSync(batchDir, { recursive: true });
    }
    
    cb(null, batchDir);
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
    const batchId = req.body.batchId || `batch-${Date.now()}`;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    console.log(`[NEV Import] Received ${files.length} files (${batchId})`);
    
    const batchDir = path.join(UPLOAD_DIR, batchId);
    
    // Create metadata file
    const metadata = {
      batchId,
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      files: files.map(f => ({
        name: f.originalname,
        size: f.size,
        path: f.path,
        mimetype: f.mimetype
      })),
      status: 'pending',
      uploadedBy: req.body.userId || 'unknown',
      discordChannelId: '1478707742603612241',
      discordThreadId: null
    };
    
    fs.writeFileSync(
      path.join(batchDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`[NEV Import] Saved metadata: ${batchDir}/metadata.json`);
    
    // Trigger AI worker (async - don't wait)
    triggerAIWorker(batchId).catch(err => {
      console.error(`[NEV Import] Worker trigger error:`, err);
    });
    
    res.json({
      success: true,
      batchId,
      fileCount: files.length,
      message: 'ไฟล์อัปโหลดสำเร็จ! AI Agent กำลังประมวลผล...',
      batchDir
    });
  } catch (error) {
    console.error('[NEV Import] Error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// Trigger AI worker
async function triggerAIWorker(batchId) {
  console.log(`[NEV Import] Triggering AI worker for ${batchId}...`);
  
  const workerScript = path.join(__dirname, 'nev-import-worker.js');
  
  exec(`node ${workerScript} ${batchId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[NEV Import] Worker error:`, error);
      return;
    }
    if (stderr) {
      console.error(`[NEV Import] Worker stderr:`, stderr);
    }
    console.log(`[NEV Import] Worker stdout:`, stdout);
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NEV Import Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`✅ Ready to receive files from Vercel`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});
