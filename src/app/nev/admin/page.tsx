'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  lastUpdated: string;
}

interface Activity {
  id: string;
  description: string;
  userName: string;
  createdAt: string;
  link: string | null;
}

export default function NevAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Fetch stats
    fetch('/api/nev/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading stats:', err);
        setLoading(false);
      });
    
    // Fetch version
    fetch('/api/nev/version')
      .then(r => r.json())
      .then(data => setVersion(data.version))
      .catch(() => {});
    
    // Fetch activities
    fetch('/api/nev/admin/activity')
      .then(r => r.json())
      .then(data => setActivities(data))
      .catch(err => console.error('Error loading activities:', err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `฿${price.toLocaleString('th-TH')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">NEV Database Admin</h1>
              <p className="text-gray-600 mt-1">จัดการข้อมูลรถยนต์ไฟฟ้า</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/nev"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                ดูเว็บไซต์
              </Link>
              <Link
                href="/nev/admin/import"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import Data
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">แบรนด์ทั้งหมด</div>
            <div className="text-4xl font-bold">{stats?.totalBrands || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">รุ่นรถทั้งหมด</div>
            <div className="text-4xl font-bold">{stats?.totalModels || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">รุ่นย่อยทั้งหมด</div>
            <div className="text-4xl font-bold">{stats?.totalVariants || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">ราคาเฉลี่ย</div>
            <div className="text-4xl font-bold">
              {stats?.priceRange ? formatPrice((stats.priceRange.min + stats.priceRange.max) / 2) : '-'}
            </div>
          </div>
        </div>

        {/* Powertrain Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">สัดส่วน Powertrain</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">BEV (ไฟฟ้าเต็มรูปแบบ)</div>
              <div className="text-2xl font-bold text-blue-600">{stats?.powertrainBreakdown?.BEV || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">PHEV (ไฮบริดปลั๊กอิน)</div>
              <div className="text-2xl font-bold text-green-600">{stats?.powertrainBreakdown?.PHEV || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">HEV (ไฮบริด)</div>
              <div className="text-2xl font-bold text-purple-600">{stats?.powertrainBreakdown?.HEV || 0}</div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">กิจกรรมล่าสุด</h2>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">ยังไม่มีกิจกรรม</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-2xl">📝</div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleString('th-TH', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  {activity.link && (
                    <Link
                      href={activity.link}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ดูรายละเอียด
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Management Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/nev/admin/brands"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">จัดการแบรนด์</h3>
                <p className="text-gray-600 text-sm">เพิ่ม/แก้ไข/ลบแบรนด์รถยนต์</p>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
            <div className="mt-4 text-blue-600 font-medium">ดูทั้งหมด →</div>
          </Link>

          <Link
            href="/nev/admin/models"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">จัดการรุ่นรถ</h3>
                <p className="text-gray-600 text-sm">เพิ่ม/แก้ไข/ลบรุ่นรถ</p>
              </div>
              <div className="text-4xl">🚙</div>
            </div>
            <div className="mt-4 text-blue-600 font-medium">ดูทั้งหมด →</div>
          </Link>

          <Link
            href="/nev/admin/variants"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">จัดการรุ่นย่อย</h3>
                <p className="text-gray-600 text-sm">เพิ่ม/แก้ไข/ลบรุ่นย่อย</p>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
            <div className="mt-4 text-blue-600 font-medium">ดูทั้งหมด →</div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">กิจกรรมล่าสุด</h2>
          <div className="text-gray-600">
            อัปเดตล่าสุด: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('th-TH') : '-'}
          </div>
        </div>

        {/* Version Footer */}
        <div className="mt-4 text-center text-sm text-gray-500">
          NEV Database Admin v{version || '1.0.0'} • {new Date().toLocaleDateString('th-TH')}
        </div>
      </main>
    </div>
  );
}
