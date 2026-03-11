'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Types
interface Brand {
  id: string;
  name: string;
  nameTh: string;
  slug: string;
  logoUrl: string | null;
  country: string;
  _count?: { models: number };
}

interface Variant {
  id: string;
  name: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  rangeStandard: string | null;
  motorHp: number | null;
  torqueNm: number | null;
  accel0100: number | null;
  topSpeedKmh: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  acChargeKw: number | null;
  hasV2l: boolean;
  v2lKw: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  curbWeightKg: number | null;
}

interface Model {
  id: string;
  brandId: string;
  name: string;
  nameTh: string | null;
  slug: string;
  year: number;
  bodyType: string | null;
  seats: number | null;
  powertrain: string;
  imageUrl: string | null;
  brand: { name: string; slug: string };
  variants: Variant[];
}

interface Stats {
  totalBrands: number;
  totalModels: number;
  totalVariants: number;
}

export default function NevHomePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [latestModels, setLatestModels] = useState<Model[]>([]);
  const [stats, setStats] = useState<Stats>({ totalBrands: 0, totalModels: 0, totalVariants: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPowertrain, setSelectedPowertrain] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/api/nev/brands').then(r => r.json()),
      fetch('/api/nev/models?limit=12').then(r => r.json()),
      fetch('/api/nev/stats').then(r => r.json()),
    ])
      .then(([brandsData, modelsData, statsData]) => {
        setBrands(brandsData.brands || []);
        setLatestModels(modelsData.models || []);
        setStats(statsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return `฿${price.toLocaleString()}`;
  };

  const getStartingPrice = (model: Model) => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  const getPowertrainStyle = (powertrain: string) => {
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

  const filteredModels = selectedPowertrain
    ? latestModels.filter(m => m.powertrain === selectedPowertrain)
    : latestModels;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/nev" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white">NEV Database</span>
              <span className="text-sm text-slate-400 ml-2">Thailand</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/nev/search"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <span>🔍</span>
              <span className="text-sm text-slate-300">ค้นหา</span>
            </Link>
            <Link 
              href="/nev/admin"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            ฐานข้อมูลรถยนต์ไฟฟ้า
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> ประเทศไทย</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            ค้นหา เปรียบเทียบ และดูสเปครถยนต์ไฟฟ้าและพลังงานใหม่ทุกรุ่นที่จำหน่ายในประเทศไทย
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 md:gap-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-8 py-6">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.totalBrands}
              </div>
              <div className="text-sm text-slate-400 mt-1">แบรนด์</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-8 py-6">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.totalModels}
              </div>
              <div className="text-sm text-slate-400 mt-1">รุ่นหลัก</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl px-8 py-6">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.totalVariants}
              </div>
              <div className="text-sm text-slate-400 mt-1">รุ่นย่อย</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-6 border-y border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-slate-400 text-sm whitespace-nowrap">ประเภท:</span>
            {['', 'BEV', 'PHEV', 'HEV', 'REEV'].map(pt => (
              <button
                key={pt}
                onClick={() => setSelectedPowertrain(pt)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedPowertrain === pt
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
                }`}
              >
                {pt || 'ทั้งหมด'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Models */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">รถยนต์ไฟฟ้าทั้งหมด</h2>
              <p className="text-slate-400 mt-1">ดูรถยนต์ไฟฟ้าและพลังงานใหม่ในประเทศไทย</p>
            </div>
            <Link 
              href="/nev/search"
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          
          {filteredModels.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-slate-400 text-lg">ยังไม่มีข้อมูลรถยนต์</p>
              <p className="text-slate-500 text-sm mt-2">กรุณาเพิ่มข้อมูลจากหน้า Admin</p>
              <Link 
                href="/nev/admin/import"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium"
              >
                <span>➕</span>
                <span>นำเข้าข้อมูล</span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModels.map((model) => {
                const startingPrice = getStartingPrice(model);
                const firstVariant = model.variants[0];
                
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
                      
                      {/* Year */}
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
                      
                      {/* Quick Specs */}
                      {firstVariant && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {firstVariant.rangeKm && (
                            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-white">{firstVariant.rangeKm}</div>
                              <div className="text-xs text-slate-400">กม. ({firstVariant.rangeStandard})</div>
                            </div>
                          )}
                          {firstVariant.motorHp && (
                            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-white">{firstVariant.motorHp}</div>
                              <div className="text-xs text-slate-400">แรงม้า</div>
                            </div>
                          )}
                          {firstVariant.batteryKwh && (
                            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-white">{firstVariant.batteryKwh}</div>
                              <div className="text-xs text-slate-400">kWh</div>
                            </div>
                          )}
                          {firstVariant.accel0100 && (
                            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-white">{firstVariant.accel0100}s</div>
                              <div className="text-xs text-slate-400">0-100 km/h</div>
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

      {/* Brands Section */}
      <section className="py-12 border-t border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">เลือกตามแบรนด์</h2>
              <p className="text-slate-400 mt-1">ดูรถยนต์ไฟฟ้าจากแบรนด์ที่คุณสนใจ</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/nev/brands/${brand.slug}`}
                className="group p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-center"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-12 object-contain mb-3 opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="text-4xl mb-3 opacity-50 group-hover:opacity-100">🚗</div>
                )}
                <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {brand.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {brand._count?.models || 0} รุ่น
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Spec Categories Info */}
      <section className="py-12 border-t border-slate-700/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">ข้อมูลที่เราจัดเก็บ</h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: '📐', title: 'ขนาดและน้ำหนัก', desc: 'ความยาว กว้าง สูง ฐานล้อ น้ำหนัก' },
              { icon: '⚡', title: 'ระบบส่งกำลัง', desc: 'มอเตอร์ กำลัง แรงบิด 0-100' },
              { icon: '🔋', title: 'แบตเตอรี่', desc: 'ความจุ kWh ระยะทาง มาตรฐาน' },
              { icon: '🔌', title: 'การชาร์จ', desc: 'AC/DC Charging V2L V2G' },
              { icon: '🛞', title: 'ช่วงล่างและเบรก', desc: 'ระบบกันสะเทือน เบรก ล้อยาง' },
              { icon: '🛡️', title: 'ความปลอดภัย', desc: 'ADAS ถุงลม เซ็นเซอร์' },
              { icon: '🎛️', title: 'อุปกรณ์ภายใน', desc: 'จอแสดงผล เบาะ พวงมาลัย' },
              { icon: '🔊', title: 'มัลติมีเดีย', desc: 'ระบบเสียง USB Bluetooth' },
            ].map((cat, i) => (
              <div 
                key={i}
                className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-white mb-1">{cat.title}</h3>
                <p className="text-sm text-slate-400">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-white font-semibold mb-2">NEV Database Thailand</p>
          <p className="text-slate-500 text-sm mb-4">© 2026 iMoD (Mod Media Co., Ltd.)</p>
          <p className="text-xs text-slate-600">Developer Beta 1.0</p>
        </div>
      </footer>
    </div>
  );
}
