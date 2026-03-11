'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Model {
  id: string;
  name: string;
  slug: string;
  year: number | null;
  bodyType: string | null;
  powertrain: string | null;
  brand: { name: string; slug: string };
  _count: { variants: number };
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nev/admin/models?page=${page}&limit=30${search ? `&search=${search}` : ''}`)
      .then(r => r.json())
      .then(data => {
        setModels(data.models || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                <Link href="/nev/admin" className="hover:text-blue-600">← Admin</Link>
              </div>
              <h1 className="text-2xl font-bold">จัดการรุ่นรถ</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <input
          type="text"
          placeholder="ค้นหารุ่นรถ..."
          className="w-full md:w-96 px-4 py-2 border rounded-lg mb-6"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />

        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">แบรนด์</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">รุ่น</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ประเภท</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Powertrain</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">รุ่นย่อย</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {models.map(model => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{model.brand?.name}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/nev/models/${model.slug}`} className="text-blue-600 hover:underline">
                          {model.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{model.bodyType || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          model.powertrain === 'BEV' ? 'bg-blue-100 text-blue-700' :
                          model.powertrain === 'PHEV' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {model.powertrain || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{model._count.variants}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {models.length === 0 && (
                <p className="text-center py-8 text-gray-500">ไม่พบข้อมูล</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  ← ก่อนหน้า
                </button>
                <span className="px-4 py-2">หน้า {page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
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
