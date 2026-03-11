'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Variant {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  imageUrl: string | null;
  priceBaht: number | null;
  priceNote: string | null;
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
  hasV2l: boolean;
  v2lKw: number | null;
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
  suspensionFront: string | null;
  suspensionRear: string | null;
  brakeFront: string | null;
  brakeRear: string | null;
  wheelSizeFront: number | null;
  wheelSizeRear: number | null;
  tireSizeFront: string | null;
  tireSizeRear: string | null;
  exteriorEquipment: string | null;
  interiorEquipment: string | null;
  safetyEquipment: string | null;
  multimediaEquipment: string | null;
  model: {
    name: string;
    brand: { name: string };
  };
}

export default function EditVariantPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(p => {
      setId(p.id);
      fetch(`/api/nev/admin/variants/${p.id}`)
        .then(r => r.json())
        .then(data => {
          setVariant(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/nev/admin/variants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variant),
      });

      if (res.ok) {
        alert('บันทึกสำเร็จ!');
        router.push('/nev/admin/variants');
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Variant, value: any) => {
    setVariant(v => v ? { ...v, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">ไม่พบข้อมูล</p>
          <Link href="/nev/admin/variants" className="text-blue-400 hover:underline">
            ← กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-400 mb-1">
            <Link href="/nev/admin" className="hover:text-blue-400">Admin</Link>
            {' › '}
            <Link href="/nev/admin/variants" className="hover:text-blue-400">Variants</Link>
          </div>
          <h1 className="text-2xl font-bold">แก้ไขรุ่นย่อย</h1>
          <p className="text-gray-400 mt-1">
            {variant.model?.brand?.name} {variant.model?.name} — {variant.name}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="max-w-5xl space-y-6">
          
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded"></span>
              ข้อมูลพื้นฐาน
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ชื่อรุ่นย่อย</label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ชื่อเต็ม</label>
                <input
                  type="text"
                  value={variant.fullName || ''}
                  onChange={e => updateField('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ราคา (บาท)</label>
                <input
                  type="number"
                  value={variant.priceBaht || ''}
                  onChange={e => updateField('priceBaht', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded"></span>
              รูปภาพ Featured
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL รูปภาพ</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={variant.imageUrl || ''}
                  onChange={e => updateField('imageUrl', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">ใส่ URL รูปภาพสำหรับแสดงเป็น Featured Image ของรุ่นนี้</p>
              </div>
              <div>
                {variant.imageUrl ? (
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <img 
                      src={variant.imageUrl} 
                      alt={variant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/640x360/1f2937/6b7280?text=Image+Error';
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 text-4xl">🖼️</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Battery & Range */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded"></span>
              แบตเตอรี่และระยะทาง
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ความจุแบตเตอรี่ (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.batteryKwh || ''}
                  onChange={e => updateField('batteryKwh', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระยะทาง (กม.)</label>
                <input
                  type="number"
                  value={variant.rangeKm || ''}
                  onChange={e => updateField('rangeKm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">มาตรฐาน</label>
                <select
                  value={variant.rangeStandard || ''}
                  onChange={e => updateField('rangeStandard', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-</option>
                  <option value="CLTC">CLTC</option>
                  <option value="WLTP">WLTP</option>
                  <option value="NEDC">NEDC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded"></span>
              สมรรถนะ
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">จำนวนมอเตอร์</label>
                <input
                  type="number"
                  value={variant.motorCount}
                  onChange={e => updateField('motorCount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">กำลัง (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.motorKw || ''}
                  onChange={e => updateField('motorKw', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">แรงม้า (hp)</label>
                <input
                  type="number"
                  value={variant.motorHp || ''}
                  onChange={e => updateField('motorHp', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">แรงบิด (Nm)</label>
                <input
                  type="number"
                  value={variant.torqueNm || ''}
                  onChange={e => updateField('torqueNm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">0-100 km/h (วินาที)</label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.accel0100 || ''}
                  onChange={e => updateField('accel0100', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ความเร็วสูงสุด (km/h)</label>
                <input
                  type="number"
                  value={variant.topSpeedKmh || ''}
                  onChange={e => updateField('topSpeedKmh', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระบบขับเคลื่อน</label>
                <select
                  value={variant.drivetrain || ''}
                  onChange={e => updateField('drivetrain', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-</option>
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Charging */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-yellow-500 rounded"></span>
              การชาร์จ
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">DC Fast Charge (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.dcChargeKw || ''}
                  onChange={e => updateField('dcChargeKw', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">DC 10-80% (นาที)</label>
                <input
                  type="number"
                  value={variant.dcChargeMin || ''}
                  onChange={e => updateField('dcChargeMin', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">AC Charge (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.acChargeKw || ''}
                  onChange={e => updateField('acChargeKw', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">พอร์ตชาร์จ</label>
                <select
                  value={variant.chargePort || ''}
                  onChange={e => updateField('chargePort', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-</option>
                  <option value="CCS2">CCS2</option>
                  <option value="GB/T">GB/T</option>
                  <option value="Tesla">Tesla</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={variant.hasV2l}
                  onChange={e => updateField('hasV2l', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-400">V2L</label>
              </div>
              {variant.hasV2l && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">V2L (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={variant.v2lKw || ''}
                    onChange={e => updateField('v2lKw', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded"></span>
              ขนาดและน้ำหนัก
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ความยาว (มม.)</label>
                <input
                  type="number"
                  value={variant.lengthMm || ''}
                  onChange={e => updateField('lengthMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ความกว้าง (มม.)</label>
                <input
                  type="number"
                  value={variant.widthMm || ''}
                  onChange={e => updateField('widthMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ความสูง (มม.)</label>
                <input
                  type="number"
                  value={variant.heightMm || ''}
                  onChange={e => updateField('heightMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระยะฐานล้อ (มม.)</label>
                <input
                  type="number"
                  value={variant.wheelbaseMm || ''}
                  onChange={e => updateField('wheelbaseMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระยะห่างจากพื้น (มม.)</label>
                <input
                  type="number"
                  value={variant.groundClearanceMm || ''}
                  onChange={e => updateField('groundClearanceMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">น้ำหนักตัวรถ (กก.)</label>
                <input
                  type="number"
                  value={variant.curbWeightKg || ''}
                  onChange={e => updateField('curbWeightKg', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">น้ำหนักรวม (กก.)</label>
                <input
                  type="number"
                  value={variant.grossWeightKg || ''}
                  onChange={e => updateField('grossWeightKg', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">พื้นที่บรรทุก (ลิตร)</label>
                <input
                  type="number"
                  value={variant.trunkLitres || ''}
                  onChange={e => updateField('trunkLitres', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Suspension & Brakes */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded"></span>
              ระบบกันสะเทือนและเบรก
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">กันสะเทือนหน้า</label>
                <input
                  type="text"
                  placeholder="เช่น MacPherson"
                  value={variant.suspensionFront || ''}
                  onChange={e => updateField('suspensionFront', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">กันสะเทือนหลัง</label>
                <input
                  type="text"
                  placeholder="เช่น Multi-link"
                  value={variant.suspensionRear || ''}
                  onChange={e => updateField('suspensionRear', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">เบรกหน้า</label>
                <input
                  type="text"
                  placeholder="เช่น Ventilated Disc"
                  value={variant.brakeFront || ''}
                  onChange={e => updateField('brakeFront', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">เบรกหลัง</label>
                <input
                  type="text"
                  placeholder="เช่น Solid Disc"
                  value={variant.brakeRear || ''}
                  onChange={e => updateField('brakeRear', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Wheels & Tires */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gray-500 rounded"></span>
              ล้อและยาง
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ขนาดล้อหน้า (นิ้ว)</label>
                <input
                  type="number"
                  value={variant.wheelSizeFront || ''}
                  onChange={e => updateField('wheelSizeFront', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ขนาดล้อหลัง (นิ้ว)</label>
                <input
                  type="number"
                  value={variant.wheelSizeRear || ''}
                  onChange={e => updateField('wheelSizeRear', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ขนาดยางหน้า</label>
                <input
                  type="text"
                  placeholder="เช่น 235/50 R19"
                  value={variant.tireSizeFront || ''}
                  onChange={e => updateField('tireSizeFront', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ขนาดยางหลัง</label>
                <input
                  type="text"
                  placeholder="เช่น 265/45 R20"
                  value={variant.tireSizeRear || ''}
                  onChange={e => updateField('tireSizeRear', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Warranty */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded"></span>
              การรับประกัน
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">รับประกันตัวรถ</label>
                <input
                  type="text"
                  placeholder="เช่น 5 ปี / 150,000 กม."
                  value={variant.warrantyVehicle || ''}
                  onChange={e => updateField('warrantyVehicle', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">รับประกันแบตเตอรี่</label>
                <input
                  type="text"
                  placeholder="เช่น 8 ปี / 160,000 กม."
                  value={variant.warrantyBattery || ''}
                  onChange={e => updateField('warrantyBattery', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Equipment (JSON) */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-indigo-500 rounded"></span>
              อุปกรณ์มาตรฐาน (JSON)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">อุปกรณ์ภายนอก</label>
                <textarea
                  rows={3}
                  placeholder='{"headlights": "LED Matrix", "mirrors": "Electric Folding"}'
                  value={variant.exteriorEquipment || ''}
                  onChange={e => updateField('exteriorEquipment', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">อุปกรณ์ภายใน</label>
                <textarea
                  rows={3}
                  placeholder='{"seats": "Leather", "centerDisplay": "15.6 inch"}'
                  value={variant.interiorEquipment || ''}
                  onChange={e => updateField('interiorEquipment', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระบบความปลอดภัย</label>
                <textarea
                  rows={3}
                  placeholder='{"airbags": 6, "adas": ["ACC", "AEB", "LDW"]}'
                  value={variant.safetyEquipment || ''}
                  onChange={e => updateField('safetyEquipment', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ระบบสื่อบันเทิง</label>
                <textarea
                  rows={3}
                  placeholder='{"audioSystem": "12 Speakers", "appleCarplay": true}'
                  value={variant.multimediaEquipment || ''}
                  onChange={e => updateField('multimediaEquipment', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 sticky bottom-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 font-semibold"
            >
              {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <Link
              href="/nev/admin/variants"
              className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
