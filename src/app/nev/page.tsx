'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { dummyBrands, dummyModels, dummyStats, Model } from './data/dummy';

export default function NevHomePage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'BEV', 'PHEV', 'HEV', 'SUV', 'Sedan', 'Hatchback'];

  // Filter models
  const filteredModels = dummyStats.latestModels.filter((model) => {
    if (activeFilter === 'All') return true;
    if (['BEV', 'PHEV', 'HEV'].includes(activeFilter)) {
      return model.powertrain === activeFilter;
    }
    if (['SUV', 'Sedan', 'Hatchback'].includes(activeFilter)) {
      return model.bodyType === activeFilter;
    }
    return true;
  });

  // Get model specs
  const getModelSpecs = (model: Model) => {
    const variant = model.variants[0];
    if (!variant) return null;
    
    return {
      motorHp: variant.motorHp,
      rangeKm: variant.rangeKm,
      batteryKwh: variant.batteryKwh,
      price: variant.priceBaht,
    };
  };

  // Get starting price
  const getStartingPrice = (model: Model) => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Apple Style */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/nev" className="flex items-center gap-3">
            <span className="text-3xl">🚗⚡</span>
            <div>
              <span className="text-xl font-bold text-gray-900">NEV Database</span>
              <span className="hidden md:inline text-gray-500 ml-2">Thailand</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/nev/search"
              className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              🔍 ค้นหา
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Apple Style */}
      <section className="py-20 text-center bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            NEV Database Thailand
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ฐานข้อมูลรถยนต์ไฟฟ้าและพลังงานใหม่ที่จำหน่ายในประเทศไทย
          </p>

          {/* Stats - Apple Style */}
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900">{dummyStats.totalBrands}</div>
              <div className="text-sm text-gray-600 mt-1">แบรนด์</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">{dummyStats.totalModels}</div>
              <div className="text-sm text-gray-600 mt-1">รุ่น</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">{dummyStats.totalVariants}</div>
              <div className="text-sm text-gray-600 mt-1">รุ่นย่อย</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs - Apple Style */}
      <section className="border-b border-gray-200 sticky top-[65px] bg-white z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Models Grid - Apple Style */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">รถยอดนิยม</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModels.map((model) => {
              const specs = getModelSpecs(model);
              const priceRange = getStartingPrice(model);
              
              return (
                <Link
                  key={model.id}
                  href={`/nev/models/${model.slug}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all border border-gray-200">
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
                          <span className="text-8xl opacity-50">🚗</span>
                        </div>
                      )}
                      {/* Powertrain Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          model.powertrain === 'BEV' 
                            ? 'bg-blue-600 text-white' 
                            : model.powertrain === 'PHEV'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}>
                          {model.powertrain}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <div className="text-sm text-gray-500 mb-1">{model.brand.name}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {model.name}
                      </h3>
                      
                      {/* Quick Specs - Apple Style */}
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        {specs?.rangeKm && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>🛣️</span>
                            <span>{specs.rangeKm} กม.</span>
                          </div>
                        )}
                        {specs?.motorHp && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>⚡</span>
                            <span>{specs.motorHp} HP</span>
                          </div>
                        )}
                        {model.bodyType && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>🚙</span>
                            <span>{model.bodyType}</span>
                          </div>
                        )}
                        {model.seats && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>👥</span>
                            <span>{model.seats} ที่นั่ง</span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      {priceRange && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-500">เริ่มต้นที่</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ฿{priceRange.min.toLocaleString()}
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

      {/* Brands Grid - Apple Style */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            เลือกรถตามแบรนด์
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {dummyBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/nev/brands/${brand.slug}`}
                className="group"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all border border-gray-200 hover:border-blue-600">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="w-full h-12 object-contain mb-2"
                    />
                  ) : (
                    <div className="text-3xl mb-2">🚗</div>
                  )}
                  <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{brand.totalModels} รุ่น</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">NEV Database Thailand</h3>
            <p className="text-gray-400 mb-4">
              Developer Beta 1.0.0 | {dummyStats.totalModels} Models | {dummyStats.totalVariants} Variants
            </p>
            <p className="text-sm text-gray-500">
              © 2026 iMoD (Mod Media Co., Ltd.)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
