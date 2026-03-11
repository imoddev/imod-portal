'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { mockBrands, mockModels, mockVariants, getBrandById, formatPrice, formatRange, formatPower, getStats } from '@/lib/nev-mock-data';

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
  variants: Array<{
    priceBaht: number | null;
    batteryKwh: number | null;
    rangeKm: number | null;
    rangeStandard: string | null;
    motorHp: number | null;
  }>;
}

export default function NevHomePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<{
    totalBrands: number;
    totalModels: number;
    totalVariants: number;
    latestModels: Model[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use mock data instead of API
    const brandsWithCount = mockBrands.map(brand => ({
      ...brand,
      _count: {
        models: mockModels.filter(m => m.brandId === brand.id).length,
      },
    }));
    
    const latestModels = mockModels.slice(0, 6).map(model => {
      const variants = mockVariants.filter(v => v.modelId === model.id);
      return {
        ...model,
        variants: variants.map(v => ({
          priceBaht: v.priceBaht,
          batteryKwh: v.batteryKwh,
          rangeKm: v.rangeKm,
          rangeStandard: v.rangeStandard,
          motorHp: v.motorHp,
        })),
      };
    });
    
    setBrands(brandsWithCount);
    setStats({
      ...getStats(),
      latestModels,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Get first variant specs
  const getModelSpecs = (model: Model) => {
    const variant = model.variants[0];
    if (!variant) return null;
    
    return {
      motorHp: variant.motorHp,
      rangeKm: variant.rangeKm,
      rangeStandard: variant.rangeStandard,
      batteryKwh: variant.batteryKwh,
      price: variant.priceBaht,
    };
  };

  const getStartingPrice = (model: Model) => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  // Powertrain badge color
  const getPowertrainColor = (powertrain: string) => {
    switch (powertrain) {
      case 'BEV': return 'bg-green-100 text-green-700';
      case 'PHEV': return 'bg-blue-100 text-blue-700';
      case 'HEV': return 'bg-purple-100 text-purple-700';
      case 'REEV': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/nev" className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <span className="text-xl font-bold text-gray-900">NEV Database</span>
              <span className="text-sm text-gray-500 ml-2">Thailand</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/nev/search"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">ค้นหา</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ฐานข้อมูลรถยนต์ไฟฟ้าประเทศไทย
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            ค้นหา เปรียบเทียบ และดูสเปครถยนต์ไฟฟ้าและพลังงานใหม่ทุกรุ่นที่จำหน่ายในประเทศไทย
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats?.totalBrands}</div>
              <div className="text-sm text-gray-500">แบรนด์</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats?.totalModels}</div>
              <div className="text-sm text-gray-500">รุ่นหลัก</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats?.totalVariants}</div>
              <div className="text-sm text-gray-500">รุ่นย่อย</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cars Section - Apple Style */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">รถยอดนิยม</h2>
          <p className="text-gray-600 mb-8">ดูรถยนต์ไฟฟ้าที่น่าสนใจ</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats?.latestModels.slice(0, 6).map((model) => {
              const brand = getBrandById(model.brandId);
              const specs = getModelSpecs(model);
              const priceRange = getStartingPrice(model);
              
              return (
                <Link
                  key={model.id}
                  href={`/nev/models/${model.slug}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all border-0 shadow-md">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {model.imageUrl ? (
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-50">🚗</span>
                        </div>
                      )}
                      {/* Powertrain Badge */}
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getPowertrainColor(model.powertrain)}`}>
                        {model.powertrain}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="text-sm text-gray-500 mb-1">{brand?.name}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{model.name}</h3>
                      
                      {/* Specs - Apple Style Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {specs?.rangeKm && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-gray-900">{specs.rangeKm}</div>
                            <div className="text-xs text-gray-500">กม. ({specs.rangeStandard})</div>
                          </div>
                        )}
                        {specs?.motorHp && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-gray-900">{specs.motorHp}</div>
                            <div className="text-xs text-gray-500">แรงม้า</div>
                          </div>
                        )}
                        {model.bodyType && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-gray-900">{model.bodyType}</div>
                            <div className="text-xs text-gray-500">ประเภท</div>
                          </div>
                        )}
                        {model.seats && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-gray-900">{model.seats}</div>
                            <div className="text-xs text-gray-500">ที่นั่ง</div>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      {priceRange && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-500 mb-1">เริ่มต้นที่</div>
                          <div className="text-xl font-bold text-blue-600">
                            {formatPrice(priceRange.min)}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explore by Brand */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">เลือกตามแบรนด์</h2>
          <p className="text-gray-600 mb-8">ดูรถยนต์ไฟฟ้าจากแบรนด์ที่คุณสนใจ</p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/nev/brands/${brand.slug}`}
                className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-500 transition-all text-center group"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-10 object-contain mb-3"
                  />
                ) : (
                  <div className="text-3xl mb-3">🚗</div>
                )}
                <div className="font-semibold text-gray-900 group-hover:text-blue-600">{brand.name}</div>
                <div className="text-xs text-gray-500 mt-1">{brand._count?.models || 0} รุ่น</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-white font-semibold mb-2">NEV Database Thailand</p>
          <p className="text-sm mb-4">© 2026 iMoD (Mod Media Co., Ltd.)</p>
          <p className="text-xs">Developer Beta 1.0</p>
        </div>
      </footer>
    </div>
  );
}
