'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Variant {
  id: string;
  name: string;
  fullName: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  motorHp: number | null;
  torqueNm: number | null;
  accel0100: number | null;
  topSpeedKmh: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  curbWeightKg: number | null;
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">ไม่พบข้อมูล</p>
          <Link href="/nev/admin/variants" className="text-blue-600 hover:underline">
            ← กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-500 mb-1">
            <Link href="/nev/admin" className="hover:text-blue-600">Admin</Link>
            {' › '}
            <Link href="/nev/admin/variants" className="hover:text-blue-600">Variants</Link>
          </div>
          <h1 className="text-2xl font-bold">แก้ไขรุ่นย่อย</h1>
          <p className="text-gray-600 mt-1">
            {variant.model?.brand?.name} {variant.model?.name} — {variant.name}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="max-w-4xl">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">ข้อมูลพื้นฐาน</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อรุ่นย่อย
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคา (บาท)
                </label>
                <input
                  type="number"
                  value={variant.priceBaht || ''}
                  onChange={e => updateField('priceBaht', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">สมรรถนะ</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แบตเตอรี่ (kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.batteryKwh || ''}
                  onChange={e => updateField('batteryKwh', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระยะทาง (กม.)
                </label>
                <input
                  type="number"
                  value={variant.rangeKm || ''}
                  onChange={e => updateField('rangeKm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แรงม้า (hp)
                </label>
                <input
                  type="number"
                  value={variant.motorHp || ''}
                  onChange={e => updateField('motorHp', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แรงบิด (Nm)
                </label>
                <input
                  type="number"
                  value={variant.torqueNm || ''}
                  onChange={e => updateField('torqueNm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  0-100 km/h (วินาที)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={variant.accel0100 || ''}
                  onChange={e => updateField('accel0100', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความเร็วสูงสุด (km/h)
                </label>
                <input
                  type="number"
                  value={variant.topSpeedKmh || ''}
                  onChange={e => updateField('topSpeedKmh', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Charging */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">การชาร์จ</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DC Fast Charge (kW)
                </label>
                <input
                  type="number"
                  value={variant.dcChargeKw || ''}
                  onChange={e => updateField('dcChargeKw', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DC 10-80% (นาที)
                </label>
                <input
                  type="number"
                  value={variant.dcChargeMin || ''}
                  onChange={e => updateField('dcChargeMin', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">ขนาด</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความยาว (มม.)
                </label>
                <input
                  type="number"
                  value={variant.lengthMm || ''}
                  onChange={e => updateField('lengthMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความกว้าง (มม.)
                </label>
                <input
                  type="number"
                  value={variant.widthMm || ''}
                  onChange={e => updateField('widthMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความสูง (มม.)
                </label>
                <input
                  type="number"
                  value={variant.heightMm || ''}
                  onChange={e => updateField('heightMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระยะฐานล้อ (มม.)
                </label>
                <input
                  type="number"
                  value={variant.wheelbaseMm || ''}
                  onChange={e => updateField('wheelbaseMm', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำหนัก (กก.)
                </label>
                <input
                  type="number"
                  value={variant.curbWeightKg || ''}
                  onChange={e => updateField('curbWeightKg', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระบบขับเคลื่อน
                </label>
                <select
                  value={variant.drivetrain || ''}
                  onChange={e => updateField('drivetrain', e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">-</option>
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <Link
              href="/nev/admin/variants"
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
