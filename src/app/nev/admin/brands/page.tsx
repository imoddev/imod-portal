'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  country: string | null;
  _count: { models: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`/api/nev/admin/brands?limit=100${search ? `&search=${search}` : ''}`)
      .then(r => r.json())
      .then(data => {
        setBrands(data.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                <Link href="/nev/admin" className="hover:text-blue-600">← Admin</Link>
              </div>
              <h1 className="text-2xl font-bold">จัดการแบรนด์</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <input
          type="text"
          placeholder="ค้นหาแบรนด์..."
          className="w-full md:w-96 px-4 py-2 border rounded-lg mb-6"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">แบรนด์</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ชื่อไทย</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ประเทศ</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">รุ่นรถ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                    <td className="px-4 py-3 text-gray-600">{brand.nameTh || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{brand.country || '-'}</td>
                    <td className="px-4 py-3 text-center">{brand._count.models}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {brands.length === 0 && (
              <p className="text-center py-8 text-gray-500">ไม่พบข้อมูล</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
