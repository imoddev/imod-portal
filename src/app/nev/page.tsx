'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Brand {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  _count: {
    models: number;
  };
}

interface Stats {
  totalBrands: number;
  totalModels: number;
  totalVariants: number;
  powertrainBreakdown: {
    BEV: number;
    PHEV: number;
    HEV: number;
  };
  priceRange: {
    min: number;
    max: number;
  } | null;
  avgRange: number | null;
}

export default function NevHomePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/nev/brands').then(r => r.json()),
      fetch('/api/nev/stats').then(r => r.json()),
    ]).then(([brandsData, statsData]) => {
      setBrands(brandsData);
      setStats(statsData);
      setLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">
            🚗⚡ NEV Database Thailand
          </h1>
          <p className="text-xl opacity-90">
            ฐานข้อมูลรถยนต์พลังงานใหม่ที่ครบครันที่สุดในประเทศไทย
          </p>
          <p className="text-sm opacity-75 mt-2">
            New Energy Vehicle Database - ข้อมูลอัปเดต มีนาคม 2026
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 -mt-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-6 text-center bg-white shadow-lg">
              <div className="text-4xl font-bold text-blue-600">{stats.totalBrands}</div>
              <div className="text-gray-600 mt-2">แบรนด์</div>
            </Card>
            <Card className="p-6 text-center bg-white shadow-lg">
              <div className="text-4xl font-bold text-green-600">{stats.totalModels}</div>
              <div className="text-gray-600 mt-2">รุ่นรถ</div>
            </Card>
            <Card className="p-6 text-center bg-white shadow-lg">
              <div className="text-4xl font-bold text-purple-600">{stats.totalVariants}</div>
              <div className="text-gray-600 mt-2">รุ่นย่อย</div>
            </Card>
            <Card className="p-6 text-center bg-white shadow-lg">
              <div className="text-4xl font-bold text-emerald-600">{stats.powertrainBreakdown.BEV}</div>
              <div className="text-gray-600 mt-2">BEV</div>
            </Card>
            <Card className="p-6 text-center bg-white shadow-lg">
              <div className="text-4xl font-bold text-orange-600">{stats.powertrainBreakdown.PHEV}</div>
              <div className="text-gray-600 mt-2">PHEV</div>
            </Card>
          </div>

          {/* Price Range */}
          {stats.priceRange && (
            <Card className="p-6 mt-4 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">ช่วงราคา</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.priceRange.min.toLocaleString()} - {stats.priceRange.max.toLocaleString()} บาท
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/nev/search">
            <div className="bg-white rounded-full shadow-lg p-4 flex items-center hover:shadow-xl transition-shadow cursor-pointer">
              <span className="text-2xl mr-3">🔍</span>
              <input
                type="text"
                placeholder="ค้นหาแบรนด์ รุ่นรถ หรือ สเปค..."
                className="flex-1 outline-none text-lg"
                readOnly
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
                ค้นหา
              </button>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/nev/search?powertrain=BEV">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-4xl mb-2">🔋</div>
              <div className="font-bold text-lg">รถไฟฟ้า (BEV)</div>
              <div className="text-sm text-gray-600 mt-1">{stats?.powertrainBreakdown.BEV || 0} รุ่น</div>
            </Card>
          </Link>
          <Link href="/nev/search?powertrain=PHEV">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-yellow-50">
              <div className="text-4xl mb-2">⚡</div>
              <div className="font-bold text-lg">ปลั๊กอินไฮบริด (PHEV)</div>
              <div className="text-sm text-gray-600 mt-1">{stats?.powertrainBreakdown.PHEV || 0} รุ่น</div>
            </Card>
          </Link>
          <Link href="/nev/search?powertrain=HEV">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="text-4xl mb-2">🔄</div>
              <div className="font-bold text-lg">ไฮบริด (HEV)</div>
              <div className="text-sm text-gray-600 mt-1">{stats?.powertrainBreakdown.HEV || 0} รุ่น</div>
            </Card>
          </Link>
          <Link href="/nev/compare">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-4xl mb-2">⚖️</div>
              <div className="font-bold text-lg">เปรียบเทียบ</div>
              <div className="text-sm text-gray-600 mt-1">เลือก 2-4 คัน</div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">แบรนด์ทั้งหมด</h2>
        
        {brands.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl text-gray-600 mb-2">ยังไม่มีข้อมูลแบรนด์</p>
            <p className="text-sm text-gray-500">กรุณา import ข้อมูลจาก Excel</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/nev/brands/${brand.slug}`}>
                <Card className="p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="w-16 h-16 mx-auto mb-3 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🚗</span>
                    </div>
                  )}
                  <div className="font-bold text-lg">{brand.name}</div>
                  {brand.nameTh && (
                    <div className="text-sm text-gray-600 mt-1">{brand.nameTh}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {brand._count.models} รุ่น
                  </div>
                  {brand.country && (
                    <div className="text-xs text-gray-400 mt-1">{brand.country}</div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            © 2026 iMoD (Mod Media Co., Ltd.) | NEV Database Thailand
          </p>
          <p className="text-xs opacity-60 mt-2">
            ข้อมูลอัปเดต มีนาคม 2026 | Developer Beta 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
