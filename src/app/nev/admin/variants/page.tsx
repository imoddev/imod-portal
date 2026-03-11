'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Variant {
  id: string;
  name: string;
  fullName: string;
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-500 mb-1">
            <Link href="/nev/admin" className="hover:text-blue-600">← Admin</Link>
          </div>
          <h1 className="text-2xl font-bold">จัดการรุ่นย่อย</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <input
          type="text"
          placeholder="ค้นหารุ่นย่อย..."
          className="w-full md:w-96 px-4 py-2 border rounded-lg mb-6"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />

        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">แบรนด์</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">รุ่น</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">รุ่นย่อย</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">ราคา</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">แบต (kWh)</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">ระยะทาง</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">แรงม้า</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">ขับเคลื่อน</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {variants.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{v.model?.brand?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{v.model?.name}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/nev/admin/variants/${v.id}`} className="text-blue-600 hover:underline">
                          {v.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">{formatPrice(v.priceBaht)}</td>
                      <td className="px-4 py-3 text-right">{v.batteryKwh || '-'}</td>
                      <td className="px-4 py-3 text-right">{v.rangeKm ? `${v.rangeKm} km` : '-'}</td>
                      <td className="px-4 py-3 text-right">{v.motorHp ? `${v.motorHp} hp` : '-'}</td>
                      <td className="px-4 py-3 text-center">{v.drivetrain || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/nev/admin/variants/${v.id}`} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {variants.length === 0 && (
                <p className="text-center py-8 text-gray-500">ไม่พบข้อมูล</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">← ก่อนหน้า</button>
                <span className="px-4 py-2">หน้า {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">ถัดไป →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
