'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Brand {
  name: string;
  slug: string;
}

interface Variant {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  rangeStandard: string | null;
  motorCount: number;
  motorKw: number | null;
  motorHp: number | null;
  torqueNm: number | null;
  topSpeedKmh: number | null;
  accel0100: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  acChargeKw: number | null;
  chargePort: string | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  groundClearanceMm: number | null;
  curbWeightKg: number | null;
  grossWeightKg: number | null;
  trunkLitres: number | null;
  warrantyVehicle: string | null;
  warrantyBattery: string | null;
  features: string | null;
  hasV2l: boolean;
  v2lKw: number | null;
  hasV2g: boolean;
  isBestSeller: boolean;
}

interface Model {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  year: number;
  bodyType: string | null;
  segment: string | null;
  seats: number | null;
  powertrain: string;
  assembly: string | null;
  madeIn: string | null;
  imageUrl: string | null;
  overview: string | null;
  brand: Brand;
  variants: Variant[];
}

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  useEffect(() => {
    fetch(`/api/nev/models/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Model not found');
        return r.json();
      })
      .then(data => {
        setModel(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600">{error || 'ไม่พบข้อมูลรถรุ่นนี้'}</p>
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/nev" className="hover:text-gray-900">NEV Database</Link>
            <span>/</span>
            <Link href={`/nev/brands/${model.brand.slug}`} className="hover:text-gray-900">{model.brand.name}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{model.name}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold mb-4">{model.fullName}</h1>
          {selectedVariant && (
            <p className="text-3xl text-gray-600">{formatPrice(selectedVariant.priceBaht)}</p>
          )}
        </div>

        {/* Image */}
        {model.imageUrl && (
          <div className="mb-16">
            <img
              src={model.imageUrl}
              alt={model.fullName}
              className="w-full max-w-4xl mx-auto"
            />
          </div>
        )}

        {/* Variant Selector (Tabs) */}
        {model.variants.length > 1 && (
          <div className="mb-12 border-b border-gray-200">
            <div className="flex gap-4 overflow-x-auto">
              {model.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {variant.name}
                  {variant.isBestSeller && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      ขายดี
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Specs Table - Apple Style */}
        {selectedVariant && (
          <div className="space-y-12">
            {/* สมรรถนะ */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">สมรรถนะ</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">มอเตอร์</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.motorCount === 1 ? 'Single Motor' : `${selectedVariant.motorCount} Motors`}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">กำลังขับเคลื่อน</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.motorHp ? `${formatNumber(selectedVariant.motorHp)} แรงม้า` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">แรงบิดสูงสุด</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.torqueNm ? `${formatNumber(selectedVariant.torqueNm)} นิวตันเมตร` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">อัตราเร่ง 0-100 กม./ชม.</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.accel0100 ? `${selectedVariant.accel0100} วินาที` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ความเร็วสูงสุด</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.topSpeedKmh ? `${formatNumber(selectedVariant.topSpeedKmh)} กม./ชม.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ระบบขับเคลื่อน</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.drivetrain || '-'}
                  </div>
                </div>
              </div>
            </section>

            {/* แบตเตอรี่และการชาร์จ */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">แบตเตอรี่และการชาร์จ</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ความจุแบตเตอรี่</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.batteryKwh ? `${selectedVariant.batteryKwh} kWh` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ระยะทาง ({selectedVariant.rangeStandard || 'NEDC'})</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.rangeKm ? `${formatNumber(selectedVariant.rangeKm)} กม.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">DC Charging</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.dcChargeKw ? `${selectedVariant.dcChargeKw} kW` : '-'}
                    {selectedVariant.dcChargeMin && ` (${selectedVariant.dcChargeMin} นาที 10-80%)`}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">AC Charging</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.acChargeKw ? `${selectedVariant.acChargeKw} kW` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">พอร์ตชาร์จ</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.chargePort || '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">V2L (Vehicle to Load)</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.hasV2l
                      ? (selectedVariant.v2lKw ? `รองรับ (${selectedVariant.v2lKw} kW)` : 'รองรับ')
                      : 'ไม่รองรับ'
                    }
                  </div>
                </div>
              </div>
            </section>

            {/* มิติและน้ำหนัก */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">มิติและน้ำหนัก</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ความยาว</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.lengthMm ? `${formatNumber(selectedVariant.lengthMm)} มม.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ความกว้าง</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.widthMm ? `${formatNumber(selectedVariant.widthMm)} มม.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ความสูง</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.heightMm ? `${formatNumber(selectedVariant.heightMm)} มม.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">ระยะฐานล้อ</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.wheelbaseMm ? `${formatNumber(selectedVariant.wheelbaseMm)} มม.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">น้ำหนักตัวรถ</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.curbWeightKg ? `${formatNumber(selectedVariant.curbWeightKg)} กก.` : '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">พื้นที่บรรทุก</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.trunkLitres ? `${formatNumber(selectedVariant.trunkLitres)} ลิตร` : '-'}
                  </div>
                </div>
              </div>
            </section>

            {/* การรับประกัน */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">การรับประกัน</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">รับประกันตัวรถ</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.warrantyVehicle || '-'}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <div className="text-sm text-gray-600 mb-1">รับประกันแบตเตอรี่</div>
                  <div className="text-2xl font-medium">
                    {selectedVariant.warrantyBattery || '-'}
                  </div>
                </div>
              </div>
            </section>

            {/* ราคา */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">ราคาเริ่มต้น</div>
                <div className="text-5xl font-semibold mb-4">
                  {formatPrice(selectedVariant.priceBaht)}
                </div>
                <div className="text-gray-600 mb-6">
                  {model.brand.name} {model.name} {selectedVariant.name}
                </div>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
                  ดูโปรโมชั่น
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Back to Brand */}
        <div className="mt-16 pt-8 border-t">
          <Link
            href={`/nev/brands/${model.brand.slug}`}
            className="text-blue-600 hover:underline"
          >
            ← ดูรถ {model.brand.name} ทั้งหมด
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>© 2026 iMoD (Mod Media Co., Ltd.) | NEV Database Thailand</p>
          <p className="mt-2 text-xs">Developer Beta 1.0</p>
        </div>
      </footer>
    </div>
  );
}
