'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportDataPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'url' | 'file'>('file');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Optional manual info
  const [manualInfo, setManualInfo] = useState({
    brand: '',
    model: '',
    variant: ''
  });
  
  // Re-upload option
  const [existingBatchId, setExistingBatchId] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUrlSubmit = async () => {
    if (!url) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/nev/admin/import/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ ดึงข้อมูลสำเร็จ!\n\n${data.message || 'AI Agent กำลังประมวลผล...'}`);
        router.push('/nev/admin');
      } else {
        alert(`❌ ${data.error || 'เกิดข้อผิดพลาด'}`);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (files.length === 0) return;
    if (files.length > 10) {
      alert('อัปโหลดได้สูงสุด 10 ไฟล์ต่อครั้ง');
      return;
    }
    
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const maxSize = 50 * 1024 * 1024;
    
    if (totalSize > maxSize) {
      alert(`ไฟล์รวมใหญ่เกินไป (${(totalSize / 1024 / 1024).toFixed(1)} MB)\nสูงสุด 50 MB`);
      return;
    }
    
    setLoading(true);
    setProgress('กำลังอัปโหลดไฟล์...');
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    if (manualInfo.brand) formData.append('brand', manualInfo.brand);
    if (manualInfo.model) formData.append('model', manualInfo.model);
    if (manualInfo.variant) formData.append('variant', manualInfo.variant);
    if (existingBatchId && existingBatchId !== 'placeholder') {
      formData.append('existingBatchId', existingBatchId);
    }
    
    try {
      setProgress('กำลังส่งไฟล์ไปยังเซิร์ฟเวอร์...');
      
      const res = await fetch('/api/nev/admin/import/batch', {
        method: 'POST',
        body: formData,
      });
      
      setProgress('กำลังประมวลผลข้อมูล...');
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.error || data.details || 'เกิดข้อผิดพลาด';
        alert(`❌ Import ไม่สำเร็จ\n\n${errorMsg}`);
        setLoading(false);
        setProgress('');
        return;
      }
      
      alert(`✅ อัปโหลดสำเร็จ!\n\nBatch ID: ${data.batchId}\nไฟล์: ${data.fileCount} ไฟล์\n\nAI Agent กำลังประมวลผล...\nจะแจ้งผลทาง Discord เมื่อเสร็จ`);
      router.push('/nev/admin');
    } catch (err: any) {
      alert(`❌ เกิดข้อผิดพลาด\n\n${err.message || err}`);
      setProgress('');
      setLoading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/nev/admin" 
                className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-colors"
              >
                <span className="text-lg">←</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">นำเข้าข้อมูล</h1>
                <p className="text-slate-400 text-sm">อัปโหลดไฟล์หรือระบุ URL เพื่อเพิ่มข้อมูลรถยนต์</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Mode Tabs */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-slate-700 flex gap-2">
            <button
              onClick={() => setMode('file')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'file'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">📁</span>
              <span>อัปโหลดไฟล์</span>
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'url'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">🔗</span>
              <span>URL</span>
            </button>
          </div>

          {/* File Upload Mode */}
          {mode === 'file' && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-dashed transition-all ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={e => {
                    const newFiles = Array.from(e.target.files || []);
                    setFiles(prev => [...prev, ...newFiles].slice(0, 10));
                  }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📥</span>
                  </div>
                  <p className="text-white text-lg font-medium mb-2">
                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก
                  </p>
                  <p className="text-slate-400 text-sm mb-4">
                    รองรับ PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (สูงสุด 10 ไฟล์)
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-sm text-slate-300">
                    <span>📎</span>
                    <span>เลือกไฟล์</span>
                  </div>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span>📋</span>
                      <span>ไฟล์ที่เลือก ({files.length}/10)</span>
                    </h3>
                    <button
                      onClick={() => setFiles([])}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl group"
                      >
                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center text-xl">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{file.name}</p>
                          <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500/30"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Info */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>📝</span>
                  <span>ข้อมูลเพิ่มเติม</span>
                  <span className="text-xs text-slate-400 font-normal">(ไม่บังคับ)</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">แบรนด์</label>
                    <input
                      type="text"
                      placeholder="เช่น BYD"
                      value={manualInfo.brand}
                      onChange={e => setManualInfo({...manualInfo, brand: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">รุ่น</label>
                    <input
                      type="text"
                      placeholder="เช่น SEALION 7"
                      value={manualInfo.model}
                      onChange={e => setManualInfo({...manualInfo, model: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">รุ่นย่อย</label>
                    <input
                      type="text"
                      placeholder="เช่น Premium"
                      value={manualInfo.variant}
                      onChange={e => setManualInfo({...manualInfo, variant: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                  <span>💡</span>
                  <span>ถ้าไม่ระบุ AI จะแยกข้อมูลให้อัตโนมัติ</span>
                </p>
              </div>

              {/* Re-upload Option */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!existingBatchId}
                    onChange={e => setExistingBatchId(e.target.checked ? 'placeholder' : '')}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-white font-medium">อัปโหลดเพิ่มไปยัง batch เดิม</span>
                    <p className="text-xs text-slate-400">ใช้เมื่อต้องการเพิ่มไฟล์เข้าไปในการ import ที่มีอยู่</p>
                  </div>
                </label>
                
                {existingBatchId && (
                  <input
                    type="text"
                    placeholder="Batch ID (เช่น batch-1234567890)"
                    value={existingBatchId === 'placeholder' ? '' : existingBatchId}
                    onChange={e => setExistingBatchId(e.target.value)}
                    className="mt-4 w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                )}
              </div>

              {/* Progress */}
              {progress && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-emerald-400">{progress}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleFileSubmit}
                disabled={files.length === 0 || loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>อัปโหลด {files.length > 0 ? `${files.length} ไฟล์` : ''}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* URL Mode */}
          {mode === 'url' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <label className="block text-sm text-slate-400 mb-2">URL ของข้อมูล</label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/car-specs.pdf"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">
                  สามารถระบุ URL ของ PDF, เว็บไซต์ หรือ Google Sheets
                </p>
              </div>

              <button
                onClick={handleUrlSubmit}
                disabled={!url || loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังดึงข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>ดึงข้อมูลจาก URL</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>💡</span>
              <span>วิธีใช้งาน</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <p className="text-white font-medium">อัปโหลดไฟล์</p>
                  <p className="text-slate-400">ลากไฟล์มาวางหรือคลิกเพื่อเลือก (สูงสุด 10 ไฟล์)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <p className="text-white font-medium">AI ประมวลผล</p>
                  <p className="text-slate-400">ระบบจะส่งไฟล์ไปยัง Mac Studio เพื่อประมวลผล</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <p className="text-white font-medium">รอการแจ้งเตือน</p>
                  <p className="text-slate-400">เมื่อประมวลผลเสร็จ จะมีการแจ้งผลทาง Discord</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">4</span>
                <div>
                  <p className="text-white font-medium">ตรวจสอบข้อมูล</p>
                  <p className="text-slate-400">ข้อมูลจะถูกเพิ่มเข้าฐานข้อมูลอัตโนมัติ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
