'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  year: number | null;
  powertrain: string;
  bodyType: string | null;
  imageUrl: string | null;
  brand: {
    name: string;
    slug: string;
  };
  variants: {
    priceBaht: number | null;
    rangeKm: number | null;
    rangeStandard: string | null;
    motorHp: number | null;
    batteryKwh: number | null;
  }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedPowertrain, setSelectedPowertrain] = useState(searchParams.get('powertrain') || '');
  const [selectedBodyType, setSelectedBodyType] = useState(searchParams.get('bodyType') || '');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedPowertrain) params.set('powertrain', selectedPowertrain);
    if (selectedBodyType) params.set('bodyType', selectedBodyType);
    
    fetch(`/api/nev/search?${params}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error searching:', error);
        setLoading(false);
      });
  }, [query, selectedPowertrain, selectedBodyType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedPowertrain) params.set('powertrain', selectedPowertrain);
    if (selectedBodyType) params.set('bodyType', selectedBodyType);
    window.history.pushState({}, '', `/nev/search?${params}`);
  };

  const getStartingPrice = (model: SearchResult) => {
    const prices = model.variants.map(v => v.priceBaht).filter((p): p is number => p !== null);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const getFirstVariant = (model: SearchResult) => model.variants[0] || null;

  const getPowertrainStyle = (powertrain: string) => {
    switch (powertrain) {
      case 'BEV': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PHEV': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'HEV': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'REEV': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return `฿${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <Link 
              href="/nev" 
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-colors"
            >
              <span className="text-lg">←</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">ค้นหารถ NEV</h1>
              <p className="text-slate-400 text-sm">ค้นหาและกรองรถยนต์ไฟฟ้า</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="bg-slate-800/30 border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาแบรนด์ รุ่นรถ..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all font-medium"
              >
                ค้นหา
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">ประเภท:</span>
              {['', 'BEV', 'PHEV', 'HEV', 'REEV'].map(pt => (
                <button
                  key={pt}
                  onClick={() => setSelectedPowertrain(pt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedPowertrain === pt
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white border border-slate-600'
                  }`}
                >
                  {pt || 'ทั้งหมด'}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">ตัวถัง:</span>
              {['', 'Sedan', 'SUV', 'MPV', 'Hatchback'].map(bt => (
                <button
                  key={bt}
                  onClick={() => setSelectedBodyType(bt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedBodyType === bt
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white border border-slate-600'
                  }`}
                >
                  {bt || 'ทั้งหมด'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">กำลังค้นหา...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">ไม่พบผลลัพธ์</p>
            <p className="text-slate-500 text-sm mt-2">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-slate-400">
              พบ <span className="text-white font-semibold">{results.length}</span> รุ่น
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((model) => {
                const startingPrice = getStartingPrice(model);
                const firstVariant = getFirstVariant(model);
                
                return (
                  <Link
                    key={model.id}
                    href={`/nev/models/${model.slug}`}
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
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPowertrainStyle(model.powertrain)}`}>
                          {model.powertrain}
                        </span>
                      </div>
                      
                      {model.year && (
                        <span className="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-300">
                          {model.year}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p className="text-sm text-emerald-400 mb-1">{model.brand?.name}</p>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {model.name}
                      </h3>
                      {model.nameTh && (
                        <p className="text-sm text-slate-500 mt-1">{model.nameTh}</p>
                      )}
                      
                      {/* Quick Specs */}
                      {firstVariant && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {firstVariant.rangeKm && (
                            <div className="bg-slate-700/30 rounded-xl p-2.5 text-center">
                              <div className="text-base font-bold text-white">{firstVariant.rangeKm}</div>
                              <div className="text-xs text-slate-400">กม.</div>
                            </div>
                          )}
                          {firstVariant.motorHp && (
                            <div className="bg-slate-700/30 rounded-xl p-2.5 text-center">
                              <div className="text-base font-bold text-white">{firstVariant.motorHp}</div>
                              <div className="text-xs text-slate-400">hp</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">เริ่มต้นที่</div>
                        <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                          {formatPrice(startingPrice)}
                        </div>
                        {model.variants.length > 1 && (
                          <div className="text-xs text-slate-500 mt-1">
                            {model.variants.length} รุ่นย่อย
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
