'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Model {
  id: string;
  name: string;
  slug: string;
  year: number | null;
  bodyType: string | null;
  powertrain: string | null;
  imageUrl: string | null;
  brand: { name: string; slug: string };
  _count: { variants: number };
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalModels, setTotalModels] = useState(0);
  const [filterPowertrain, setFilterPowertrain] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    let url = `/api/nev/admin/models?page=${page}&limit=24`;
    if (search) url += `&search=${search}`;
    if (filterPowertrain) url += `&powertrain=${filterPowertrain}`;
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setModels(data.models || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalModels(data.pagination?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page, filterPowertrain]);

  const getPowertrainStyle = (powertrain: string | null) => {
    switch (powertrain) {
      case 'BEV':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PHEV':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'HEV':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'REEV':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
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
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🚗</span>
                  <span>จัดการรุ่นรถ</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  {totalModels} รุ่น
                </p>
              </div>
            </div>
            <Link
              href="/nev/admin/import"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/25"
            >
              <span>➕</span>
              <span>เพิ่มรุ่นใหม่</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-700 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="ค้นหารุ่นรถ..."
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['', 'BEV', 'PHEV', 'HEV'].map(pt => (
              <button
                key={pt}
                onClick={() => { setFilterPowertrain(pt); setPage(1); }}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterPowertrain === pt
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600'
                }`}
              >
                {pt || 'ทั้งหมด'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">กำลังโหลด...</p>
            </div>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-slate-400 text-lg">ไม่พบข้อมูลรุ่นรถ</p>
            <p className="text-slate-500 text-sm mt-2">ลองค้นหาด้วยคำอื่น หรือเพิ่มรุ่นใหม่</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {models.map(model => (
                <Link
                  key={model.id}
                  href={`/nev/admin/models/${model.slug}`}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  {/* Image */}
                  <div className="aspect-video bg-slate-700/50 relative overflow-hidden">
                    {model.imageUrl ? (
                      <img
                        src={model.imageUrl}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl opacity-30">🚗</span>
                      </div>
                    )}
                    
                    {/* Powertrain Badge */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold border ${getPowertrainStyle(model.powertrain)}`}>
                      {model.powertrain || '-'}
                    </span>
                    
                    {/* Variants Count */}
                    <span className="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-300">
                      {model._count.variants} รุ่นย่อย
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm text-emerald-400 mb-1">{model.brand?.name}</p>
                    <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">
                      {model.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                      {model.year && <span>{model.year}</span>}
                      {model.bodyType && (
                        <>
                          <span>•</span>
                          <span>{model.bodyType}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`/nev/models/${model.slug}`, '_blank');
                        }}
                        className="flex-1 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                      >
                        👁️ ดูหน้าเว็บ
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Will navigate to edit page
                        }}
                        className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
                      >
                        ✏️ แก้ไข
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl disabled:opacity-50 hover:bg-slate-700 transition-colors"
                >
                  ← ก่อนหน้า
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                            : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl disabled:opacity-50 hover:bg-slate-700 transition-colors"
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
