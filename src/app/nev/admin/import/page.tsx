'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ImportDataPage() {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [preview, setPreview] = useState<any>(null);

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
      setPreview(data);
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
    
    setLoading(true);
    setProgress('กำลังอัปโหลดไฟล์...');
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    try {
      const res = await fetch('/api/nev/admin/import/batch', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'เกิดข้อผิดพลาด');
        setLoading(false);
        setProgress('');
        return;
      }
      
      setPreview(data);
      setProgress('');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/nev/admin/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preview),
      });
      
      if (res.ok) {
        alert('บันทึกสำเร็จ!');
        setPreview(null);
        setUrl('');
        setFiles([]);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-500 mb-1">
            <Link href="/nev/admin" className="hover:text-blue-600">← Admin</Link>
          </div>
          <h1 className="text-2xl font-bold">นำเข้าข้อมูล</h1>
          <p className="text-gray-600 mt-1">อัปโหลดไฟล์หรือระบุ URL</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!preview ? (
          <div className="max-w-2xl">
            {/* Mode Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setMode('url')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                    mode === 'url' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  📎 URL
                </button>
                <button
                  onClick={() => setMode('file')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                    mode === 'file' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  📁 อัปโหลดไฟล์
                </button>
              </div>

              {mode === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://example.com/spec.pdf"
                    className="w-full px-4 py-2 border rounded-lg mb-4"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!url || loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'กำลังประมวลผล...' : 'ดึงข้อมูล'}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกไฟล์ (สูงสุด 10 ไฟล์)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      onChange={e => setFiles(Array.from(e.target.files || []))}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-gray-600 mb-1">
                        {files.length > 0 ? `เลือก ${files.length} ไฟล์` : 'คลิกเพื่อเลือกไฟล์'}
                      </p>
                      <p className="text-sm text-gray-500">
                        รองรับ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                      </p>
                    </label>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">ไฟล์ที่เลือก:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {files.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm">
                            <span className="truncate">{f.name}</span>
                            <span className="text-gray-500 ml-2">{(f.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                      {progress && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                          {progress}
                        </div>
                      )}
                      <button
                        onClick={handleFileSubmit}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'กำลังประมวลผล...' : 'อัปโหลด'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Supported Formats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">รูปแบบที่รองรับ</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• PDF - ใบสเปค, โบรชัวร์</li>
                <li>• DOC/DOCX - เอกสาร Microsoft Word</li>
                <li>• XLS/XLSX - ตาราง Excel</li>
                <li>• JPG/PNG - รูปภาพ (จะแปลงเป็น WebP อัตโนมัติ)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">ตรวจสอบข้อมูล</h2>
              
              {preview.data?.specs ? (
                <div className="space-y-4">
                  {preview.fileCount && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-blue-900">
                        ประมวลผลจาก {preview.fileCount} ไฟล์สำเร็จ
                      </p>
                      <p className="text-xs text-blue-700 mt-1">Batch ID: {preview.batchId}</p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">แบรนด์</p>
                      <p className="font-medium">{preview.data.specs.brand || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">รุ่น</p>
                      <p className="font-medium">{preview.data.specs.model || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">รุ่นย่อย</p>
                      <p className="font-medium">{preview.data.specs.variant || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ราคา</p>
                      <p className="font-medium">{preview.data.specs.priceBaht ? `฿${preview.data.specs.priceBaht.toLocaleString()}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">แบตเตอรี่</p>
                      <p className="font-medium">{preview.data.specs.batteryKwh ? `${preview.data.specs.batteryKwh} kWh` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ระยะทาง</p>
                      <p className="font-medium">{preview.data.specs.rangeKm ? `${preview.data.specs.rangeKm} km` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">แรงม้า</p>
                      <p className="font-medium">{preview.data.specs.motorHp ? `${preview.data.specs.motorHp} hp` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ระบบขับเคลื่อน</p>
                      <p className="font-medium">{preview.data.specs.drivetrain || '-'}</p>
                    </div>
                  </div>
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600">ดูข้อมูลทั้งหมด (JSON)</summary>
                    <pre className="mt-2 bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                      {JSON.stringify(preview, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleConfirm}
                disabled={loading || !preview.data?.specs}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
