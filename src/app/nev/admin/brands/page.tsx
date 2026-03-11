'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  country: string | null;
  logoUrl: string | null;
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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">
                <Link href="/nev/admin" className="hover:text-blue-400">← Admin</Link>
              </div>
              <h1 className="text-2xl font-bold">จัดการแบรนด์</h1>
            </div>
            <Link
              href="/nev/admin/brands/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              + เพิ่มแบรนด์
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ค้นหาแบรนด์..."
            className="w-full md:w-96 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="text-gray-400 text-sm">แบรนด์ทั้งหมด</div>
                <div className="text-2xl font-bold text-blue-400">{brands.length}</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="text-gray-400 text-sm">รุ่นรถทั้งหมด</div>
                <div className="text-2xl font-bold text-green-400">
                  {brands.reduce((sum, b) => sum + b._count.models, 0)}
                </div>
              </div>
            </div>

            {/* Brands Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map(brand => (
                <Link
                  key={brand.id}
                  href={`/nev/admin/brands/${brand.slug}`}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-xl font-bold">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold group-hover:text-blue-400 transition">
                          {brand.name}
                        </h3>
                        {brand.nameTh && (
                          <p className="text-sm text-gray-400">{brand.nameTh}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      {brand.country && (
                        <>
                          <span>{brand.country}</span>
                          <span className="text-gray-600">•</span>
                        </>
                      )}
                      <span>{brand._count.models} รุ่น</span>
                    </div>
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition">
                      แก้ไข →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {brands.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">ไม่พบข้อมูล</div>
                <Link
                  href="/nev/admin/brands/new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  + เพิ่มแบรนด์แรก
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
