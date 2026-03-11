'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { dummyBrands, dummyModels } from '../../data/dummy';

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Find brand
  const brand = dummyBrands.find(b => b.slug === slug);
  
  // Find models for this brand
  const models = dummyModels.filter(m => m.brand.slug === slug);

  if (!brand) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบแบรนด์นี้</h1>
          <Link 
            href="/nev" 
            className="text-blue-600 hover:underline font-medium"
          >
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  // Get starting price
  const getStartingPrice = (model: typeof models[0]) => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  // Get powertrain badge
  const getPowertrainBadge = (powertrain: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      BEV: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'ไฟฟ้า 100%' },
      PHEV: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'ปลั๊กอินไฮบริด' },
      HEV: { bg: 'bg-green-100', text: 'text-green-700', label: 'ไฮบริด' },
      REEV: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Range Extender' },
    };
    const badge = badges[powertrain] || { bg: 'bg-gray-100', text: 'text-gray-700', label: powertrain };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/nev" className="text-blue-600 hover:underline">NEV Database</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{brand.name}</span>
          </nav>
        </div>
      </div>

      {/* Header - Apple Style */}
      <header className="py-16 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-24 h-24 mx-auto object-contain"
              />
            ) : (
              <div className="text-6xl mb-4">🚗</div>
            )}
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-2">{brand.name}</h1>
          {brand.nameTh && (
            <p className="text-2xl text-gray-600 mb-4">{brand.nameTh}</p>
          )}
          
          <div className="flex justify-center gap-6 text-sm text-gray-600">
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
      </header>

      {/* Models Grid - Apple Style */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {models.length === 0 ? (
            <Card className="p-12 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-600">ยังไม่มีข้อมูลรถของแบรนด์นี้</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {models.map((model) => {
                const startingPrice = getStartingPrice(model);
                
                return (
                  <Link
                    key={model.id}
                    href={`/nev/models/${model.slug}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all border border-gray-200 h-full">
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
                        
                        {/* Badge */}
                        <div className="absolute top-4 left-4">
                          {getPowertrainBadge(model.powertrain)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {model.name}
                        </h3>
                        {model.nameTh && (
                          <p className="text-sm text-gray-600 mb-3">{model.nameTh}</p>
                        )}

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                          {model.year && (
                            <span className="px-2 py-1 bg-gray-100 rounded">{model.year}</span>
                          )}
                          {model.bodyType && (
                            <span className="px-2 py-1 bg-gray-100 rounded">{model.bodyType}</span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 rounded">{model.variants.length} รุ่นย่อย</span>
                        </div>

                        {/* Price */}
                        {startingPrice && (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">เริ่มต้นที่</div>
                            <div className="text-2xl font-bold text-gray-900">
                              ฿{startingPrice.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/nev"
            className="text-blue-600 hover:underline font-medium"
          >
            ← ดูแบรนด์ทั้งหมด
          </Link>
        </div>
      </section>
    </div>
  );
}
