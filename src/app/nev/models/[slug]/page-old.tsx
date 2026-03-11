'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { dummyModels } from '../../data/dummy';
import SpecsTable from '../../components/SpecsTable';

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Find model by slug
  const model = dummyModels.find(m => m.slug === slug);

  if (!model) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลรถรุ่นนี้</h1>
          <p className="text-gray-600 mb-6">รุ่นที่คุณค้นหาอาจยังไม่มีในระบบ</p>
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

  const getPowertrainLabel = (powertrain: string) => {
    const labels: Record<string, string> = {
      BEV: 'รถไฟฟ้า 100%',
      PHEV: 'ปลั๊กอินไฮบริด',
      HEV: 'ไฮบริด',
      REEV: 'Range Extender',
      ICE: 'เครื่องยนต์',
    };
    return labels[powertrain] || powertrain;
  };

  const getStartingPrice = () => {
    const prices = model.variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  const priceRange = getStartingPrice();

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb - Apple Style */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/nev" className="text-blue-600 hover:underline">NEV Database</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/nev/brands/${model.brand.slug}`} className="text-blue-600 hover:underline">
              {model.brand.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{model.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section - Apple Style */}
      <header className="py-16 text-center">
        <div className="container mx-auto px-4">
          {/* Badge */}
          <div className="flex justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {getPowertrainLabel(model.powertrain)}
            </span>
            {model.year && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {model.year}
              </span>
            )}
            {model.assembly && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                {model.assembly}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {model.brand.name} {model.name}
          </h1>
          {model.nameTh && (
            <p className="text-2xl text-gray-600 mb-6">{model.nameTh}</p>
          )}

          {/* Quick Specs */}
          <div className="flex justify-center gap-8 text-sm text-gray-600 mb-8">
            {model.bodyType && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🚙</span>
                <span>{model.bodyType}</span>
              </div>
            )}
            {model.seats && (
              <div className="flex items-center gap-2">
                <span className="text-xl">👥</span>
                <span>{model.seats} ที่นั่ง</span>
              </div>
            )}
            {model.madeIn && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🏭</span>
                <span>ประกอบ{model.madeIn === 'Thailand' ? 'ในไทย' : model.madeIn}</span>
              </div>
            )}
          </div>

          {/* Price */}
          {priceRange && (
            <div className="text-4xl font-bold text-gray-900">
              {priceRange.min === priceRange.max ? (
                <>฿{priceRange.min.toLocaleString()}</>
              ) : (
                <>฿{priceRange.min.toLocaleString()} - ฿{priceRange.max.toLocaleString()}</>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Image - Apple Style */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="aspect-[16/9] max-w-4xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {model.imageUrl ? (
              <img
                src={model.imageUrl}
                alt={`${model.brand.name} ${model.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-[200px] opacity-50">🚗</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Overview - Apple Style */}
      {model.overview && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">ภาพรวม</h2>
            <p className="text-xl text-gray-600 leading-relaxed">{model.overview}</p>
          </div>
        </section>
      )}

      {/* Highlights - Apple Style */}
      {model.highlights.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">จุดเด่น</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {model.highlights.map((highlight, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{highlight}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specs Comparison Table - Apple Style */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            เปรียบเทียบรุ่นย่อย ({model.variants.length} รุ่น)
          </h2>
          <SpecsTable variants={model.variants} />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            สนใจ {model.brand.name} {model.name}?
          </h3>
          <p className="text-gray-600 mb-8">เปรียบเทียบกับรถรุ่นอื่นเพื่อตัดสินใจ</p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/nev/compare?models=${model.slug}`}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              เปรียบเทียบรถ
            </Link>
            <Link
              href={`/nev/brands/${model.brand.slug}`}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              ดูรถ {model.brand.name} ทั้งหมด
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
