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
  type: string;
  folder: string;
  timestamp: string;
  files: number;
  totalSize: number;
  brand: string;
  model: string;
  variant: string | null;
  status: string;
}

export default function NevAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');

  useEffect(() => {
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
    
    fetch('/api/nev/version')
      .then(r => r.json())
      .then(data => setVersion(data.version))
      .catch(() => {});
    
    fetch('/api/nev/admin/activity')
      .then(r => r.json())
      .then(data => setActivities(data.activities || []))
      .catch(err => console.error('Error loading activities:', err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `฿${price.toLocaleString('th-TH')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NEV Database Admin</h1>
                <p className="text-slate-400 text-sm">จัดการข้อมูลรถยนต์ไฟฟ้า</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/nev"
                className="px-4 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2"
              >
                <span>🌐</span>
                <span>ดูเว็บไซต์</span>
              </Link>
              <Link
                href="/nev/admin/import"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 font-medium shadow-lg shadow-emerald-500/25"
              >
                <span>📥</span>
                <span>Import Data</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-blue-300">แบรนด์ทั้งหมด</div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏢</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{stats?.totalBrands || 0}</div>
            <div className="text-sm text-blue-400 mt-2">แบรนด์รถยนต์</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-emerald-300">รุ่นรถทั้งหมด</div>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚗</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{stats?.totalModels || 0}</div>
            <div className="text-sm text-emerald-400 mt-2">รุ่นรถยนต์</div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 backdrop-blur-sm rounded-2xl p-6 border border-violet-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-violet-300">รุ่นย่อยทั้งหมด</div>
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔋</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{stats?.totalVariants || 0}</div>
            <div className="text-sm text-violet-400 mt-2">รุ่นย่อย/Variant</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-amber-300">ราคาเฉลี่ย</div>
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              {stats?.priceRange ? formatPrice(Math.round((stats.priceRange.min + stats.priceRange.max) / 2)) : '-'}
            </div>
            <div className="text-sm text-amber-400 mt-2">ราคาเฉลี่ยทุกรุ่น</div>
          </div>
        </div>

        {/* Powertrain Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-sm">⚡</span>
            สัดส่วน Powertrain
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-blue-600/30 to-blue-700/20 rounded-xl p-5 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                  ⚡
                </div>
                <div>
                  <div className="text-sm text-blue-300">BEV</div>
                  <div className="text-xs text-blue-400">ไฟฟ้าเต็มรูปแบบ</div>
                </div>
              </div>
              <div className="text-4xl font-bold text-white">{stats?.powertrainBreakdown?.BEV || 0}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/30 to-green-700/20 rounded-xl p-5 border border-green-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">
                  🔌
                </div>
                <div>
                  <div className="text-sm text-green-300">PHEV</div>
                  <div className="text-xs text-green-400">ไฮบริดปลั๊กอิน</div>
                </div>
              </div>
              <div className="text-4xl font-bold text-white">{stats?.powertrainBreakdown?.PHEV || 0}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/30 to-purple-700/20 rounded-xl p-5 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                  🔄
                </div>
                <div>
                  <div className="text-sm text-purple-300">HEV</div>
                  <div className="text-xs text-purple-400">ไฮบริด</div>
                </div>
              </div>
              <div className="text-4xl font-bold text-white">{stats?.powertrainBreakdown?.HEV || 0}</div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-sm">📋</span>
              กิจกรรมล่าสุด
            </h2>
            <div className="text-sm text-slate-400">
              อัปเดตล่าสุด: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('th-TH') : '-'}
            </div>
          </div>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-400 text-lg">ยังไม่มีกิจกรรม</p>
              <p className="text-slate-500 text-sm mt-1">กิจกรรมจะแสดงเมื่อมีการเพิ่ม/แก้ไขข้อมูล</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.folder || index}
                  className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all border border-slate-600/50"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {activity.type === 'NEW_FOLDER' ? '📁' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">
                      {activity.type === 'NEW_FOLDER' ? 'อัปโหลดข้อมูลใหม่: ' : ''}
                      {activity.brand} {activity.model} {activity.variant || ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-slate-400">📄 {activity.files} ไฟล์</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">
                        {(activity.totalSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-sm text-slate-400">
                        {new Date(activity.timestamp).toLocaleString('th-TH', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        activity.status === 'pending_parse' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {activity.status === 'pending_parse' ? 'รอประมวลผล' : activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Management Links */}
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-lg flex items-center justify-center text-sm">⚙️</span>
          จัดการข้อมูล
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <Link
            href="/nev/admin/brands"
            className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                🏢
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats?.totalBrands || 0}</div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">จัดการแบรนด์</h3>
            <p className="text-slate-400 text-sm mb-4">เพิ่ม/แก้ไข/ลบแบรนด์รถยนต์</p>
            <div className="text-blue-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
              ดูทั้งหมด <span>→</span>
            </div>
          </Link>

          <Link
            href="/nev/admin/models"
            className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                🚗
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats?.totalModels || 0}</div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">จัดการรุ่นรถ</h3>
            <p className="text-slate-400 text-sm mb-4">เพิ่ม/แก้ไข/ลบรุ่นรถ</p>
            <div className="text-emerald-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
              ดูทั้งหมด <span>→</span>
            </div>
          </Link>

          <Link
            href="/nev/admin/variants"
            className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                🔋
              </div>
              <div className="text-2xl font-bold text-violet-400">{stats?.totalVariants || 0}</div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">จัดการรุ่นย่อย</h3>
            <p className="text-slate-400 text-sm mb-4">เพิ่ม/แก้ไข/ลบรุ่นย่อย</p>
            <div className="text-violet-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
              ดูทั้งหมด <span>→</span>
            </div>
          </Link>
        </div>

        {/* Version Footer */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 text-sm text-slate-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            NEV Database Admin v{version || '1.0.0'} • {new Date().toLocaleDateString('th-TH')}
          </div>
        </div>
      </main>
    </div>
  );
}
