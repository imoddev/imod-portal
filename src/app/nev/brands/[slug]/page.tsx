'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  fullName: string | null;
  year: number | null;
  bodyType: string | null;
  powertrain: string;
  imageUrl: string | null;
  isNewModel: boolean;
  variants: {
    priceBaht: number | null;
  }[];
}

interface Brand {
  name: string;
  nameTh: string | null;
  logoUrl: string | null;
  country: string | null;
  website: string | null;
}

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [models, setModels] = useState<Model[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/nev/models?brandSlug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          setBrand(data[0].brand);
          setModels(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading models:', error);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">ไม่พบข้อมูลแบรนด์</p>
          <Link href="/nev" className="text-blue-600 hover:underline mt-4 inline-block">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const getPowertrainBadge = (powertrain: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      BEV: { bg: 'bg-green-100', text: 'text-green-800', label: 'ไฟฟ้า 100%' },
      PHEV: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'ปลั๊กอินไฮบริด' },
      HEV: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'ไฮบริด' },
    };
    const badge = badges[powertrain] || { bg: 'bg-gray-100', text: 'text-gray-800', label: powertrain };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStartingPrice = (model: Model) => {
    const prices = model.variants.map(v => v.priceBaht).filter((p): p is number => p !== null);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/nev" className="text-blue-600 hover:underline mb-4 inline-block">
            ← กลับหน้าแรก
          </Link>
          
          <div className="flex items-center gap-6">
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-24 h-24 object-contain"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{brand.name}</h1>
              {brand.nameTh && (
                <p className="text-xl text-gray-600 mt-1">{brand.nameTh}</p>
              )}
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                {brand.country && <span>🌍 {brand.country}</span>}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🔗 เว็บไซต์
                  </a>
                )}
                <span>📊 {models.length} รุ่น</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="container mx-auto px-4 py-12">
        {models.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-600">ยังไม่มีข้อมูลรถของแบรนด์นี้</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => {
              const startingPrice = getStartingPrice(model);
              
              return (
                <Link key={model.id} href={`/nev/models/${model.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
                    {/* Image */}
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                      {model.imageUrl ? (
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">🚗</span>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {model.isNewModel && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                        {getPowertrainBadge(model.powertrain)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {model.name}
                      </h3>
                      {model.nameTh && (
                        <p className="text-sm text-gray-600 mb-3">{model.nameTh}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                        {model.year && <span>📅 {model.year}</span>}
                        {model.bodyType && <span>🚙 {model.bodyType}</span>}
                        <span>🔧 {model.variants.length} รุ่นย่อย</span>
                      </div>

                      {startingPrice && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-gray-500">ราคาเริ่มต้น</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {startingPrice.toLocaleString()} ฿
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
    </div>
  );
}
