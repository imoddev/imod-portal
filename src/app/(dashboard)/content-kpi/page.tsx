"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, CheckCircle, FileText, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KPIData, MemberKPI } from "@/app/api/content/kpi/route";

const COLORS = ["#ED2887", "#612BAE", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
const MEMBER_COLORS: Record<string, string> = {
  อาร์ต: "#ED2887",
  กิ๊ฟ: "#612BAE",
  เต็นท์: "#3B82F6",
  กานต์: "#10B981",
  KK: "#F59E0B",
  "พี่ซา": "#EF4444",
};

function getMemberColor(nickname: string) {
  return MEMBER_COLORS[nickname] || "#8B5CF6";
}

function SpecialtyBadge({ member }: { member: MemberKPI }) {
  const topCat = Object.entries(member.categories).sort((a, b) => b[1] - a[1])[0]?.[0];
  const isShorts = member.shorts / member.total > 0.5;
  const isYT = member.youtube / member.total > 0.15;
  const isPic = member.picPosts / member.total > 0.4;

  if (isShorts) return <Badge className="bg-orange-500 text-white text-xs">Shorts 🎬</Badge>;
  if (isYT) return <Badge className="bg-red-500 text-white text-xs">YouTube 📺</Badge>;
  if (isPic) return <Badge className="bg-purple-500 text-white text-xs">Visual 🎨</Badge>;
  if (topCat === "AI") return <Badge className="bg-blue-500 text-white text-xs">AI 🤖</Badge>;
  if (topCat === "Android") return <Badge className="bg-green-500 text-white text-xs">Android 🤖</Badge>;
  if (topCat === "Apple") return <Badge className="bg-gray-700 text-white text-xs">Apple 🍎</Badge>;
  if (topCat === "EV") return <Badge className="bg-emerald-500 text-white text-xs">EV ⚡</Badge>;
  return <Badge className="bg-gray-500 text-white text-xs">General</Badge>;
}

export default function ContentKPIPage() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/content/kpi");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="ml-3 text-gray-500">กำลังโหลด KPI...</span>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-400 mt-20">ไม่สามารถโหลดข้อมูลได้</div>;

  const activeMembers = data.members.filter(m => m.isActive);
  const thisMonthKey = "มี.ค. 2026";
  const thisMonthTotal = data.monthlyTrend.find(m => m.month === thisMonthKey);
  const thisMonthCount = thisMonthTotal
    ? Object.entries(thisMonthTotal).filter(([k]) => k !== "month").reduce((s, [, v]) => s + (Number(v) || 0), 0)
    : 0;

  const memberBarData = activeMembers.map(m => ({
    name: m.nickname,
    Website: m.website,
    Shorts: m.shorts,
    YouTube: m.youtube,
    "Pic Posts": m.picPosts,
  }));

  const memberNames = activeMembers.map(m => m.nickname);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Team KPI</h1>
          <p className="text-sm text-gray-500 mt-1">ข้อมูลจาก Lark Base · {data.total.toLocaleString()} records</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          รีเฟรช
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">งานทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">สมาชิก Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeMembers.length} คน</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Done Rate</p>
                <p className="text-2xl font-bold text-green-600">99.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">เดือนนี้</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{thisMonthCount} งาน</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Performance Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">🏆 Performance รายคน</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {activeMembers.map((member, idx) => (
            <Card key={member.name} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: getMemberColor(member.nickname) }}
              />
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getMemberColor(member.nickname) }}
                    >
                      {member.nickname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{member.nickname}</p>
                      <p className="text-xs text-gray-400">#{idx + 1} Ranking</p>
                    </div>
                  </div>
                  <SpecialtyBadge member={member} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">งานทั้งหมด</span>
                    <span className="font-bold text-gray-900 dark:text-white">{member.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((member.total / (data.members[0]?.total || 1)) * 100, 100)}%`,
                        backgroundColor: getMemberColor(member.nickname),
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
                    <span>Web: {Math.round((member.website / member.total) * 100)}%</span>
                    <span>Shorts: {Math.round((member.shorts / member.total) * 100)}%</span>
                    <span>YT: {Math.round((member.youtube / member.total) * 100)}%</span>
                    <span>ลูกค้า: {member.clientWork} งาน</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 งานแต่ละคน (แบ่งตามประเภท)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={memberBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Website" stackId="a" fill="#ED2887" />
                <Bar dataKey="Shorts" stackId="a" fill="#612BAE" />
                <Bar dataKey="YouTube" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Pic Posts" stackId="a" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🏷️ สัดส่วน Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, payload }: { name?: string; payload?: { percentage?: number } }) => `${name} ${payload?.percentage ?? 0}%`}
                  labelLine={false}
                >
                  {data.categories.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} งาน`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📅 Trend รายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthlyTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {memberNames.map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={getMemberColor(name)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 สัดส่วนประเภท Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.contentTypes.map((ct, idx) => (
              <div key={ct.name} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600 dark:text-gray-300 truncate">{ct.name}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full transition-all flex items-center justify-end pr-2"
                    style={{
                      width: `${ct.percentage}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                      minWidth: "40px",
                    }}
                  >
                    <span className="text-white text-xs font-medium">{ct.percentage}%</span>
                  </div>
                </div>
                <div className="w-16 text-right text-sm text-gray-500">{ct.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
