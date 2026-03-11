'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Variant {
  priceBaht: number | null;
  rangeKm: number | null;
  rangeStandard: string | null;
  motorHp: number | null;
  batteryKwh: number | null;
}

interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  year: number | null;
  bodyType: string | null;
  powertrain: string;
  imageUrl: string | null;
  variants: Variant[];
}

interface Brand {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  country: string | null;
  logoUrl: string | null;
  models: Model[];
}

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/nev/brands/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Brand not found');
        return r.json();
      })
      .then(data => {
        setBrand(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">ไม่พบแบรนด์นี้</h1>
          <Link 
            href="/nev" 
            className="text-emerald-400 hover:underline font-medium"
          >
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const models = brand.models || [];

  const getStartingPrice = (model: Model) => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  const getFirstVariant = (model: Model) => model.variants[0] || null;

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
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/nev" className="hover:text-white transition-colors">NEV Database</Link>
            <span>/</span>
            <span className="text-white font-medium">{brand.name}</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="mb-6">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-24 h-24 mx-auto object-contain"
              />
            ) : (
              <div className="text-6xl">🚗</div>
            )}
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-2">{brand.name}</h1>
          {brand.nameTh && (
            <p className="text-2xl text-slate-400 mb-4">{brand.nameTh}</p>
          )}
          
          <div className="flex justify-center gap-6 text-sm text-slate-400">
            {brand.country && (
              <div className="flex items-center gap-2">
                <span>🌍</span>
                <span>{brand.country}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>🚙</span>
              <span>{models.length} รุ่น</span>
            </div>
          </div>
        </div>
      </section>

      {/* Models Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {models.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-slate-400">ยังไม่มีข้อมูลรถของแบรนด์นี้</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {models.map((model) => {
                const startingPrice = getStartingPrice(model);
                const firstVariant = getFirstVariant(model);
                
                return (
                  <Link
                    key={model.id}
                    href={`/nev/models/${model.slug}`}
                    className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-md"
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
          )}
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 border-t border-slate-700">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/nev"
            className="text-emerald-400 hover:underline font-medium"
          >
            ← ดูแบรนด์ทั้งหมด
          </Link>
        </div>
      </section>
    </div>
  );
}
