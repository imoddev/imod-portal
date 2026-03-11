'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Variant {
  id: string;
  name: string;
  fullName: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  rangeStandard: string | null;
  motorHp: number | null;
  torqueNm: number | null;
  drivetrain: string | null;
  dcChargeMin: number | null;
  isBestSeller: boolean;
}

interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  fullName: string | null;
  year: number | null;
  bodyType: string | null;
  powertrain: string;
  seats: number | null;
  imageUrl: string | null;
  overview: string | null;
  highlights: string[];
  brand: {
    name: string;
    slug: string;
  };
  variants: Variant[];
}

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/nev/models?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          setModel(data[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading model:', error);
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

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">ไม่พบข้อมูลรถรุ่นนี้</p>
          <Link href="/nev" className="text-blue-600 hover:underline mt-4 inline-block">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const getPowertrainLabel = (powertrain: string) => {
    const labels: Record<string, string> = {
      BEV: 'รถไฟฟ้า 100%',
      PHEV: 'ปลั๊กอินไฮบริด',
      HEV: 'ไฮบริด',
    };
    return labels[powertrain] || powertrain;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href={`/nev/brands/${model.brand.slug}`} className="text-white hover:underline mb-4 inline-block opacity-90">
            ← {model.brand.name}
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">
            {model.brand.name} {model.name}
          </h1>
          {model.nameTh && (
            <p className="text-xl opacity-90">{model.nameTh}</p>
          )}
          
          <div className="flex gap-4 mt-4 text-sm">
            <span>⚡ {getPowertrainLabel(model.powertrain)}</span>
            {model.year && <span>📅 {model.year}</span>}
            {model.bodyType && <span>🚙 {model.bodyType}</span>}
            {model.seats && <span>👥 {model.seats} ที่นั่ง</span>}
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {model.imageUrl ? (
              <img
                src={model.imageUrl}
                alt={`${model.brand.name} ${model.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-9xl">🚗</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview */}
      {(model.overview || model.highlights.length > 0) && (
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">ภาพรวม</h2>
            {model.overview && (
              <p className="text-gray-700 mb-6">{model.overview}</p>
            )}
            
            {model.highlights.length > 0 && (
              <div>
                <h3 className="font-bold mb-3">จุดเด่น:</h3>
                <ul className="space-y-2">
                  {model.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Variants */}
      <div className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-6">รุ่นย่อยทั้งหมด ({model.variants.length})</h2>
        
        {model.variants.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">ยังไม่มีข้อมูลรุ่นย่อย</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {model.variants.map((variant) => (
              <Card key={variant.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {variant.name}
                    </h3>
                    <p className="text-sm text-gray-600">{variant.fullName}</p>
                  </div>
                  
                  <div className="text-right">
                    {variant.priceBaht ? (
                      <>
                        <div className="text-sm text-gray-500">ราคา</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {variant.priceBaht.toLocaleString()} ฿
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">ไม่ระบุราคา</span>
                    )}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {variant.batteryKwh && (
                    <div>
                      <div className="text-gray-500">🔋 แบตเตอรี่</div>
                      <div className="font-medium">{variant.batteryKwh} kWh</div>
                    </div>
                  )}
                  
                  {variant.rangeKm && (
                    <div>
                      <div className="text-gray-500">📏 ระยะทาง</div>
                      <div className="font-medium">
                        {variant.rangeKm} km
                        {variant.rangeStandard && (
                          <span className="text-xs text-gray-400"> ({variant.rangeStandard})</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {variant.motorHp && (
                    <div>
                      <div className="text-gray-500">⚡ กำลัง</div>
                      <div className="font-medium">{variant.motorHp} แรงม้า</div>
                    </div>
                  )}
                  
                  {variant.torqueNm && (
                    <div>
                      <div className="text-gray-500">🔧 แรงบิด</div>
                      <div className="font-medium">{variant.torqueNm} Nm</div>
                    </div>
                  )}
                  
                  {variant.drivetrain && (
                    <div>
                      <div className="text-gray-500">🚗 ขับเคลื่อน</div>
                      <div className="font-medium">{variant.drivetrain}</div>
                    </div>
                  )}
                  
                  {variant.dcChargeMin && (
                    <div>
                      <div className="text-gray-500">⚡ ชาร์จเร็ว</div>
                      <div className="font-medium">{variant.dcChargeMin} นาที (10-80%)</div>
                    </div>
                  )}
                </div>

                {variant.isBestSeller && (
                  <div className="mt-4 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                    🏆 Best Seller
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <Link
            href={`/nev/compare?models=${model.slug}`}
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            เปรียบเทียบกับรถรุ่นอื่น
          </Link>
        </div>
      </div>
    </div>
  );
}
