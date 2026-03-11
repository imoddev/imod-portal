'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getModelBySlug, getBrandById, getVariantsByModel, mockVariants } from '@/lib/nev-mock-data';
import { useState } from 'react';

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const model = getModelBySlug(slug);
  const brand = model ? getBrandById(model.brandId) : null;
  const variants = model ? getVariantsByModel(model.id) : [];
  
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant = variants[selectedVariantIndex] || null;

  if (!model || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600">ไม่พบข้อมูลรถรุ่นนี้</p>
          <Link href="/nev" className="text-blue-600 hover:underline mt-4 inline-block">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    return num.toLocaleString('th-TH');
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'ติดต่อสอบถาม';
    return `฿${price.toLocaleString('th-TH')}`;
  };

  // Powertrain badge color
  const getPowertrainColor = (powertrain: string) => {
    switch (powertrain) {
      case 'BEV': return 'bg-green-100 text-green-700 border-green-200';
      case 'PHEV': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'HEV': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'REEV': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/nev" className="hover:text-gray-900">NEV Database</Link>
            <span>/</span>
            <Link href={`/nev/brands/${brand.slug}`} className="hover:text-gray-900">{brand.name}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{model.name}</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">{brand.nameTh || brand.name}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {brand.name} {model.name}
            </h1>
            {model.nameTh && (
              <div className="text-xl text-gray-500 mb-4">{model.nameTh}</div>
            )}
            <p className="text-gray-600 max-w-2xl mx-auto">{model.overview}</p>
          </div>

          {/* Tags */}
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getPowertrainColor(model.powertrain)}`}>
              ⚡ {model.powertrain}
            </span>
            {model.bodyType && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {model.bodyType}
              </span>
            )}
            {model.segment && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                Segment {model.segment}
              </span>
            )}
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {model.seats} ที่นั่ง
            </span>
          </div>

          {/* Image Placeholder */}
          <div className="max-w-3xl mx-auto aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            {model.imageUrl ? (
              <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-8xl opacity-30">🚗</span>
            )}
          </div>
        </div>
      </section>

      {/* Variant Selector - Apple Style */}
      {variants.length > 1 && (
        <section className="border-b bg-white sticky top-[65px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-4">
              {variants.map((variant, index) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantIndex(index)}
                  className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedVariantIndex === index
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {variant.name}
                  {variant.priceBaht && (
                    <span className="ml-2 text-sm opacity-70">
                      ฿{(variant.priceBaht / 1000).toFixed(0)}K
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specs Comparison Table - Apple Style */}
      {selectedVariant && (
        <main className="container mx-auto px-4 py-16">
          {/* Price Header */}
          <div className="text-center mb-16">
            <div className="text-sm text-gray-500 mb-2">{selectedVariant.fullName}</div>
            <div className="text-5xl font-bold text-gray-900 mb-4">
              {formatPrice(selectedVariant.priceBaht)}
            </div>
          </div>

          {/* Key Specs Grid - Apple Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {/* Range */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-2">🔋</div>
              <div className="text-3xl font-bold text-gray-900">
                {selectedVariant.rangeKm || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                กม. ({selectedVariant.rangeStandard || 'NEDC'})
              </div>
            </div>

            {/* Power */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-gray-900">
                {selectedVariant.motorHp || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">แรงม้า</div>
            </div>

            {/* 0-100 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-2">🏎️</div>
              <div className="text-3xl font-bold text-gray-900">
                {selectedVariant.accel0100 || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">วินาที (0-100)</div>
            </div>

            {/* Top Speed */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-2">🚀</div>
              <div className="text-3xl font-bold text-gray-900">
                {selectedVariant.topSpeedKmh || '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">กม./ชม.</div>
            </div>
          </div>

          {/* Detailed Specs Sections */}
          <div className="space-y-12">
            {/* Battery & Range */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
                🔋 แบตเตอรี่และระยะทาง
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <SpecRow label="ความจุแบตเตอรี่" value={selectedVariant.batteryKwh ? `${selectedVariant.batteryKwh} kWh` : '-'} />
                <SpecRow label="ระยะทาง" value={selectedVariant.rangeKm ? `${formatNumber(selectedVariant.rangeKm)} กม. (${selectedVariant.rangeStandard || 'NEDC'})` : '-'} />
                <SpecRow label="DC Fast Charging" value={selectedVariant.dcChargeKw ? `${selectedVariant.dcChargeKw} kW` : '-'} highlight />
                <SpecRow label="DC Charge (10-80%)" value={selectedVariant.dcChargeMin ? `${selectedVariant.dcChargeMin} นาที` : '-'} />
                <SpecRow label="AC Charging" value={selectedVariant.acChargeKw ? `${selectedVariant.acChargeKw} kW` : '-'} />
                <SpecRow label="พอร์ตชาร์จ" value={selectedVariant.chargePort || '-'} />
                <SpecRow label="V2L" value={selectedVariant.hasV2l ? `รองรับ${selectedVariant.v2lKw ? ` (${selectedVariant.v2lKw} kW)` : ''}` : 'ไม่รองรับ'} />
              </div>
            </section>

            {/* Performance */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
                🏎️ สมรรถนะ
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <SpecRow label="กำลังมอเตอร์" value={selectedVariant.motorKw ? `${selectedVariant.motorKw} kW` : '-'} />
                <SpecRow label="แรงม้า" value={selectedVariant.motorHp ? `${formatNumber(selectedVariant.motorHp)} hp` : '-'} highlight />
                <SpecRow label="แรงบิดสูงสุด" value={selectedVariant.torqueNm ? `${formatNumber(selectedVariant.torqueNm)} Nm` : '-'} highlight />
                <SpecRow label="อัตราเร่ง 0-100 กม./ชม." value={selectedVariant.accel0100 ? `${selectedVariant.accel0100} วินาที` : '-'} highlight />
                <SpecRow label="ความเร็วสูงสุด" value={selectedVariant.topSpeedKmh ? `${formatNumber(selectedVariant.topSpeedKmh)} กม./ชม.` : '-'} />
                <SpecRow label="ระบบขับเคลื่อน" value={selectedVariant.drivetrain || '-'} />
              </div>
            </section>

            {/* Dimensions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
                📐 มิติและน้ำหนัก
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <SpecRow label="ความยาว" value={selectedVariant.lengthMm ? `${formatNumber(selectedVariant.lengthMm)} มม.` : '-'} />
                <SpecRow label="ความกว้าง" value={selectedVariant.widthMm ? `${formatNumber(selectedVariant.widthMm)} มม.` : '-'} />
                <SpecRow label="ความสูง" value={selectedVariant.heightMm ? `${formatNumber(selectedVariant.heightMm)} มม.` : '-'} />
                <SpecRow label="ระยะฐานล้อ" value={selectedVariant.wheelbaseMm ? `${formatNumber(selectedVariant.wheelbaseMm)} มม.` : '-'} />
                <SpecRow label="น้ำหนักตัวรถ" value={selectedVariant.curbWeightKg ? `${formatNumber(selectedVariant.curbWeightKg)} กก.` : '-'} />
                <SpecRow label="พื้นที่บรรทุก" value={selectedVariant.trunkLitres ? `${formatNumber(selectedVariant.trunkLitres)} ลิตร` : '-'} />
              </div>
            </section>

            {/* Warranty */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
                🛡️ การรับประกัน
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <SpecRow label="รับประกันตัวรถ" value={selectedVariant.warrantyVehicle || '-'} highlight />
                <SpecRow label="รับประกันแบตเตอรี่" value={selectedVariant.warrantyBattery || '-'} highlight />
              </div>
            </section>

            {/* Features */}
            {selectedVariant.features && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
                  ✨ ฟีเจอร์
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(selectedVariant.features).map(([category, items]) => (
                    <div key={category} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 capitalize">{category}</h3>
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-colors">
              เปรียบเทียบรุ่นนี้กับรถคันอื่น
            </button>
          </div>

          {/* Back Link */}
          <div className="mt-16 pt-8 border-t">
            <Link
              href={`/nev/brands/${brand.slug}`}
              className="text-blue-600 hover:underline"
            >
              ← ดูรถ {brand.name} ทั้งหมด
            </Link>
          </div>
        </main>
      )}

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

// Spec Row Component - Apple Style
function SpecRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-4 rounded-lg ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
