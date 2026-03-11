'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Types
interface Brand {
  id: string;
  name: string;
  nameTh?: string;
  _count?: { models: number };
}

interface Model {
  id: string;
  name: string;
  nameTh?: string;
  brandId: string;
  variants?: Variant[];
}

interface Variant {
  id: string;
  name: string;
  modelId: string;
}

// Searchable Dropdown Component
function SearchableDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  loading: loadingOptions,
}: {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setSearch('');
    setIsOpen(false);
    setIsCustom(false);
  };

  const handleCustomInput = () => {
    setIsCustom(true);
    setIsOpen(false);
    onChange('');
  };

  // ✅ FIX: Find selected option's label (not ID)
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : (value || '');

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm text-slate-400 mb-2">{label}</label>
      
      {isCustom ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`พิมพ์${label}ใหม่...`}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-emerald-500 rounded-xl text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setIsCustom(false);
              onChange('');
            }}
            className="px-3 py-2 bg-slate-700 text-slate-400 rounded-xl hover:bg-slate-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-left flex items-center justify-between transition-colors truncate ${
            disabled
              ? 'border-slate-700 text-slate-600 cursor-not-allowed'
              : isOpen
              ? 'border-emerald-500 text-white'
              : 'border-slate-600 text-white hover:border-slate-500'
          }`}
        >
          <span className={`truncate ${displayValue ? 'text-white' : 'text-slate-500'}`}>
            {displayValue || placeholder}
          </span>
          <span className="text-slate-400 ml-2 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
        </button>
      )}

      {isOpen && !isCustom && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-700">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none text-sm"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {loadingOptions ? (
              <div className="px-4 py-3 text-slate-400 text-sm text-center">
                กำลังโหลด...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                    value === opt.value ? 'bg-emerald-500/20 text-emerald-400' : 'text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-400 text-sm text-center">
                ไม่พบข้อมูล
              </div>
            )}
          </div>

          {/* Add new option */}
          <div className="border-t border-slate-700">
            <button
              onClick={handleCustomInput}
              className="w-full px-4 py-3 text-left text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
            >
              <span>➕</span>
              <span>เพิ่ม{label}ใหม่</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ImportDataPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'url' | 'file'>('file');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Brand/Model/Variant data from API
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Selected values
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  
  // Manual info (for custom input or variant)
  const [manualInfo, setManualInfo] = useState({
    brand: '',
    model: '',
    variant: ''
  });
  
  // Re-upload option
  const [existingBatchId, setExistingBatchId] = useState('');

  // Fetch brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await fetch('/api/nev/brands');
        const data = await res.json();
        setBrands(data.brands || []);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Fetch models when brand is selected
  useEffect(() => {
    if (!selectedBrandId) {
      setModels([]);
      return;
    }
    
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const res = await fetch(`/api/nev/models?brandId=${selectedBrandId}`);
        const data = await res.json();
        setModels(data.models || []);
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModels();
  }, [selectedBrandId]);

  // Handle brand selection
  const handleBrandChange = (value: string) => {
    // Check if it's a brand ID or custom text
    const brand = brands.find(b => b.id === value);
    if (brand) {
      setSelectedBrandId(brand.id);
      setManualInfo(prev => ({ ...prev, brand: brand.name }));
    } else {
      // Custom input
      setSelectedBrandId('');
      setManualInfo(prev => ({ ...prev, brand: value }));
    }
    // Reset model and variant
    setSelectedModelId('');
    setManualInfo(prev => ({ ...prev, model: '', variant: '' }));
  };

  // Handle model selection
  const handleModelChange = (value: string) => {
    const model = models.find(m => m.id === value);
    if (model) {
      setSelectedModelId(model.id);
      setManualInfo(prev => ({ ...prev, model: model.name }));
    } else {
      setSelectedModelId('');
      setManualInfo(prev => ({ ...prev, model: value }));
    }
    // Reset variant
    setManualInfo(prev => ({ ...prev, variant: '' }));
  };

  // Get variants from selected model
  const currentModel = models.find(m => m.id === selectedModelId);
  const variants = currentModel?.variants || [];

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
    
    // ✅ Fix: Check before append - don't send if empty/undefined
    if (manualInfo.brand && manualInfo.brand.trim()) {
      formData.append('brand', manualInfo.brand.trim());
    } else {
      console.warn('Brand is empty - folder will use batch-timestamp');
    }
    
    if (manualInfo.model && manualInfo.model.trim()) {
      formData.append('model', manualInfo.model.trim());
    }
    
    if (manualInfo.variant && manualInfo.variant.trim()) {
      formData.append('variant', manualInfo.variant.trim());
    }
    
    if (existingBatchId && existingBatchId !== 'placeholder') {
      formData.append('existingBatchId', existingBatchId);
    }
    
    // Debug log before sending
    console.log('Sending to Mac Studio:', {
      brand: manualInfo.brand?.trim() || '(empty)',
      model: manualInfo.model?.trim() || '(empty)',
      variant: manualInfo.variant?.trim() || '(empty)',
      fileCount: files.length
    });
    
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

              {/* Optional Info - Dropdowns */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 relative z-50">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>📝</span>
                  <span>ข้อมูลเพิ่มเติม</span>
                  <span className="text-xs text-slate-400 font-normal">(ไม่บังคับ)</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Brand Dropdown */}
                  <SearchableDropdown
                    label="แบรนด์"
                    placeholder="เลือกแบรนด์..."
                    options={brands.map(b => ({
                      value: b.id,
                      label: b.nameTh ? `${b.name} (${b.nameTh})` : b.name,
                    }))}
                    value={selectedBrandId || manualInfo.brand}
                    onChange={handleBrandChange}
                    loading={loadingBrands}
                  />
                  
                  {/* Model Dropdown */}
                  <SearchableDropdown
                    label="โมเดล"
                    placeholder="เลือกโมเดล..."
                    options={models.map(m => ({
                      value: m.id,
                      label: m.nameTh ? `${m.name} (${m.nameTh})` : m.name,
                    }))}
                    value={selectedModelId || manualInfo.model}
                    onChange={handleModelChange}
                    disabled={!selectedBrandId && !manualInfo.brand}
                    loading={loadingModels}
                  />
                  
                  {/* Variant Dropdown */}
                  <SearchableDropdown
                    label="รุ่นย่อย"
                    placeholder="เลือกรุ่นย่อย..."
                    options={variants.map(v => ({
                      value: v.id,
                      label: v.name,
                    }))}
                    value={manualInfo.variant}
                    onChange={(value) => {
                      const variant = variants.find(v => v.id === value);
                      setManualInfo(prev => ({
                        ...prev,
                        variant: variant ? variant.name : value
                      }));
                    }}
                    disabled={!selectedModelId && !manualInfo.model}
                  />
                </div>
                
                {/* Show selected values */}
                {(manualInfo.brand || manualInfo.model || manualInfo.variant) && (
                  <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">ข้อมูลที่เลือก:</p>
                    <p className="text-sm text-emerald-400">
                      {[manualInfo.brand, manualInfo.model, manualInfo.variant].filter(Boolean).join(' → ')}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                  <span>💡</span>
                  <span>ถ้าไม่ระบุ AI จะแยกข้อมูลให้อัตโนมัติ | กด "➕ เพิ่มใหม่" ถ้าไม่พบในรายการ</span>
                </p>
              </div>

              {/* Re-upload Option - Select existing variant/folder */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 relative z-10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!existingBatchId}
                    onChange={e => setExistingBatchId(e.target.checked ? 'placeholder' : '')}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-white font-medium">อัปโหลดเพิ่มไปยังรุ่นเดิม</span>
                    <p className="text-xs text-slate-400">ใช้เมื่อต้องการเพิ่มไฟล์เข้าไปในรุ่นที่มีอยู่แล้ว</p>
                  </div>
                </label>
                
                {existingBatchId && (
                  <div className="mt-4">
                    <SearchableDropdown
                      label="เลือกรุ่นที่ต้องการเพิ่มไฟล์"
                      placeholder="ค้นหารุ่น หรือโฟลเดอร์เก่า..."
                      options={[
                        // Recent folders (from models with variants)
                        ...models.flatMap(m => 
                          (m.variants || []).map(v => ({
                            value: `${m.name}-${v.name}`,
                            label: `${brands.find(b => b.id === m.brandId)?.name || ''} ${m.name} - ${v.name}`,
                          }))
                        ),
                        // Add option to type custom batch ID
                      ]}
                      value={existingBatchId === 'placeholder' ? '' : existingBatchId}
                      onChange={(value) => setExistingBatchId(value || 'placeholder')}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      💡 เลือกจากรายการ หรือกด "➕ เพิ่มใหม่" แล้วพิมพ์ชื่อโฟลเดอร์
                    </p>
                  </div>
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
