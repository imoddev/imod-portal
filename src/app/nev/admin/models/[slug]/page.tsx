'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  fullName: string;
  year: number | null;
  bodyType: string | null;
  segment: string | null;
  seats: number | null;
  powertrain: string;
  assembly: string | null;
  madeIn: string | null;
  imageUrl: string | null;
  overview: string | null;
  isActive: boolean;
  isNewModel: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function EditModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(p => {
      fetch(`/api/nev/admin/models/${p.slug}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            setModel(null);
          } else {
            setModel(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/nev/admin/models/${model.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model),
      });

      if (res.ok) {
        alert('บันทึกสำเร็จ!');
        router.push('/nev/admin/models');
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Model, value: unknown) => {
    setModel(m => m ? { ...m, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">ไม่พบข้อมูล</p>
          <Link href="/nev/admin/models" className="text-blue-400 hover:underline">
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
            <Link href="/nev/admin/models" className="hover:text-blue-400">Models</Link>
          </div>
          <h1 className="text-2xl font-bold">แก้ไขรุ่นรถ</h1>
          <p className="text-gray-400 mt-1">
            {model.brand?.name} {model.name}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="max-w-4xl space-y-6">
          
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded"></span>
              ข้อมูลพื้นฐาน
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ชื่อรุ่น (EN)</label>
                <input
                  type="text"
                  value={model.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ชื่อรุ่น (TH)</label>
                <input
                  type="text"
                  value={model.nameTh || ''}
                  onChange={e => updateField('nameTh', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ชื่อเต็ม</label>
                <input
                  type="text"
                  value={model.fullName || ''}
                  onChange={e => updateField('fullName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ปีรุ่น</label>
                <input
                  type="number"
                  value={model.year || ''}
                  onChange={e => updateField('year', e.target.value ? parseInt(e.target.value) : null)}
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
                  value={model.imageUrl || ''}
                  onChange={e => updateField('imageUrl', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                {model.imageUrl ? (
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <img 
                      src={model.imageUrl} 
                      alt={model.name}
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

          {/* Classification */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded"></span>
              การจำแนก
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Powertrain</label>
                <select
                  value={model.powertrain}
                  onChange={e => updateField('powertrain', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="BEV">BEV (ไฟฟ้า 100%)</option>
                  <option value="PHEV">PHEV (ปลั๊กอินไฮบริด)</option>
                  <option value="HEV">HEV (ไฮบริด)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Body Type</label>
                <select
                  value={model.bodyType || ''}
                  onChange={e => updateField('bodyType', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="MPV">MPV</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="COUPE">Coupe</option>
                  <option value="CONVERTIBLE">Convertible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Segment</label>
                <select
                  value={model.segment || ''}
                  onChange={e => updateField('segment', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="A">A (Mini)</option>
                  <option value="B">B (Small)</option>
                  <option value="C">C (Medium)</option>
                  <option value="D">D (Large)</option>
                  <option value="E">E (Executive)</option>
                  <option value="F">F (Luxury)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">จำนวนที่นั่ง</label>
                <input
                  type="number"
                  value={model.seats || ''}
                  onChange={e => updateField('seats', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ประกอบ</label>
                <select
                  value={model.assembly || ''}
                  onChange={e => updateField('assembly', e.target.value || null)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="CBU">CBU (นำเข้าทั้งคัน)</option>
                  <option value="CKD">CKD (ประกอบในประเทศ)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">ผลิตที่</label>
                <input
                  type="text"
                  value={model.madeIn || ''}
                  onChange={e => updateField('madeIn', e.target.value || null)}
                  placeholder="Thailand, China, etc."
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-amber-500 rounded"></span>
              รายละเอียด
            </h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Overview</label>
              <textarea
                value={model.overview || ''}
                onChange={e => updateField('overview', e.target.value || null)}
                rows={4}
                placeholder="รายละเอียดเกี่ยวกับรถรุ่นนี้..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded"></span>
              สถานะ
            </h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={model.isActive}
                  onChange={e => updateField('isActive', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500"
                />
                <span>แสดงบนเว็บไซต์</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={model.isNewModel}
                  onChange={e => updateField('isNewModel', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-900 text-green-500 focus:ring-green-500"
                />
                <span>รุ่นใหม่ (New Badge)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <Link
              href="/nev/admin/models"
              className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
            >
              ยกเลิก
            </Link>
            <Link
              href={`/nev/models/${model.slug}`}
              target="_blank"
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 ml-auto"
            >
              🌐 ดูหน้าเว็บ
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
