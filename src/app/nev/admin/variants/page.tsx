'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Variant {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  motorHp: number | null;
  drivetrain: string | null;
  model: { name: string; brand: { name: string } };
}

export default function AdminVariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nev/admin/variants?page=${page}&limit=30${search ? `&search=${search}` : ''}`)
      .then(r => r.json())
      .then(data => {
        setVariants(data.variants || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page]);

  const formatPrice = (p: number | null) => p ? `฿${p.toLocaleString('th-TH')}` : '-';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">
                <Link href="/nev/admin" className="hover:text-blue-400">← Admin</Link>
              </div>
              <h1 className="text-2xl font-bold">จัดการรุ่นย่อย</h1>
            </div>
            <Link
              href="/nev/admin/variants/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              + เพิ่มรุ่นย่อย
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ค้นหารุ่นย่อย..."
            className="w-full md:w-96 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Variants Grid */}
            <div className="space-y-3">
              {variants.map(v => (
                <Link
                  key={v.id}
                  href={`/nev/admin/variants/${v.slug}`}
                  className="block bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-400">{v.model?.brand?.name}</span>
                        <span className="text-gray-600">›</span>
                        <span className="text-sm text-gray-400">{v.model?.name}</span>
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-blue-400 transition">
                        {v.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      {/* Price */}
                      <div className="text-right">
                        <div className="text-gray-400 text-xs mb-1">ราคา</div>
                        <div className="font-semibold text-green-400">{formatPrice(v.priceBaht)}</div>
                      </div>

                      {/* Battery */}
                      <div className="text-right">
                        <div className="text-gray-400 text-xs mb-1">แบต</div>
                        <div className="font-semibold">{v.batteryKwh ? `${v.batteryKwh} kWh` : '-'}</div>
                      </div>

                      {/* Range */}
                      <div className="text-right">
                        <div className="text-gray-400 text-xs mb-1">ระยะทาง</div>
                        <div className="font-semibold">{v.rangeKm ? `${v.rangeKm} km` : '-'}</div>
                      </div>

                      {/* Power */}
                      <div className="text-right">
                        <div className="text-gray-400 text-xs mb-1">แรงม้า</div>
                        <div className="font-semibold">{v.motorHp ? `${v.motorHp} hp` : '-'}</div>
                      </div>

                      {/* Drivetrain */}
                      <div className="text-right">
                        <div className="text-gray-400 text-xs mb-1">ขับเคลื่อน</div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          v.drivetrain === 'AWD' ? 'bg-red-900/50 text-red-400' :
                          v.drivetrain === 'RWD' ? 'bg-blue-900/50 text-blue-400' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {v.drivetrain || '-'}
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition">
                        แก้ไข →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {variants.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">ไม่พบข้อมูล</div>
                <Link
                  href="/nev/admin/variants/new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  + เพิ่มรุ่นย่อยแรก
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 hover:border-blue-500 transition"
                >
                  ← ก่อนหน้า
                </button>
                <span className="px-4 py-2 text-gray-400">
                  หน้า {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 hover:border-blue-500 transition"
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
