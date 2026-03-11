'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Brand {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  _count: {
    models: number;
  };
}

interface Model {
  id: string;
  name: string;
  slug: string;
  brand: {
    name: string;
    slug: string;
  };
  bodyType: string | null;
  seats: number | null;
  powertrain: string;
  imageUrl: string | null;
  variants: {
    priceBaht: number | null;
    batteryKwh: number | null;
    rangeKm: number | null;
    motorHp: number | null;
  }[];
}

interface Stats {
  totalBrands: number;
  totalModels: number;
  totalVariants: number;
  latestModels: Model[];
}

export default function NevHomePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/nev/brands').then(r => r.json()),
      fetch('/api/nev/stats').then(r => r.json()),
    ]).then(([brandsData, statsData]) => {
      setBrands(brandsData);
      setStats(statsData);
      setLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get specs from first variant
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

  const getStartingPrice = (model: Model) => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/nev" className="flex items-center gap-2">
            <span className="text-2xl font-bold">🚗⚡</span>
            <span className="text-xl font-bold">NEV Database Thailand</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <span>🌐</span>
              <span className="text-sm font-medium">ไทย</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <span>🇹🇭</span>
              <span className="text-sm font-medium">Thailand</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Popular Cars Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Popular Cars</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats?.latestModels.slice(0, 6).map((model) => {
              const specs = getModelSpecs(model);
              const priceRange = getStartingPrice(model);
              
              return (
                <Link
                  key={model.id}
                  href={`/nev/models/${model.slug}`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all">
                    {/* Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {model.imageUrl ? (
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">🚗</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-4">{model.brand.name} {model.name}</h3>
                      
                      {/* Specs Grid */}
                      <div className="space-y-2 mb-4">
                        {model.bodyType && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Body Type</span>
                            <span className="font-medium">{model.bodyType}</span>
                          </div>
                        )}
                        
                        {specs?.motorHp && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Motor Power (HP)</span>
                            <span className="font-medium">{specs.motorHp}</span>
                          </div>
                        )}
                        
                        {specs?.rangeKm && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">EV Range (km)</span>
                            <span className="font-medium">{specs.rangeKm}</span>
                          </div>
                        )}
                        
                        {model.seats && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Seats</span>
                            <span className="font-medium">{model.seats}</span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      {priceRange && (
                        <div className="pt-4 border-t">
                          <div className="text-xl font-bold text-blue-600">
                            {priceRange.min === priceRange.max
                              ? `฿${priceRange.min.toLocaleString()}`
                              : `฿${priceRange.min.toLocaleString()}-${priceRange.max.toLocaleString()}`
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Explore by Brand */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Explore New Cars by Brand</h2>
          
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/nev/brands/${brand.slug}`}
                className="block p-6 border rounded-lg hover:shadow-lg hover:border-blue-600 transition-all text-center"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-full h-12 object-contain mb-2"
                  />
                ) : (
                  <div className="text-3xl mb-2">🚗</div>
                )}
                <div className="font-medium text-sm">{brand.name}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>© 2026 iMoD (Mod Media Co., Ltd.) | NEV Database Thailand</p>
          <p className="mt-2 text-xs">Developer Beta 1.0 - {stats?.totalModels} Models | {stats?.totalVariants} Variants</p>
        </div>
      </footer>
    </div>
  );
}
