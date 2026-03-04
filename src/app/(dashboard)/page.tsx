"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Eye,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  ExternalLink,
  Newspaper,
  DollarSign,
  BarChart3,
  Clock,
  Activity,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// iMoD CI Colors (Official 2021)
const COLORS = {
  pink: "#ED2887",      // Primary
  purple: "#612BAE",    // Secondary
  violet: "#8B5CF6",
  blue: "#3B82F6",
  green: "#22C55E",
};

// Sample data for charts
const weeklyData = [
  { name: "จ.", imod: 12, ev: 8 },
  { name: "อ.", imod: 15, ev: 10 },
  { name: "พ.", imod: 18, ev: 7 },
  { name: "พฤ.", imod: 14, ev: 12 },
  { name: "ศ.", imod: 20, ev: 9 },
  { name: "ส.", imod: 8, ev: 5 },
  { name: "อา.", imod: 6, ev: 4 },
];

const monthlyViewsData = [
  { name: "ม.ค.", views: 1200000 },
  { name: "ก.พ.", views: 1350000 },
  { name: "มี.ค.", views: 980000 },
];

const categoryData = [
  { name: "Apple", value: 45, color: COLORS.pink },
  { name: "Android", value: 20, color: COLORS.blue },
  { name: "EV", value: 25, color: COLORS.green },
  { name: "อื่นๆ", value: 10, color: COLORS.purple },
];

interface WPStats {
  site: string;
  totalPosts: number;
  todayPosts: number;
  recentPosts: Array<{
    id: number;
    title: string;
    date: string;
    author: string;
    url: string;
    featuredImage?: string;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, change, changeType, icon, description }: StatCardProps) {
  return (
    <Card className="stat-card overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ED2887]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {changeType === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : changeType === "down" ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={`text-sm ${
                  changeType === "up" ? "text-green-500" : 
                  changeType === "down" ? "text-red-500" : 
                  "text-muted-foreground"
                }`}>
                  {change}
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-[#ED2887]/10 text-[#ED2887]">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [imodStats, setImodStats] = useState<WPStats | null>(null);
  const [evStats, setEvStats] = useState<WPStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [imodRes, evRes] = await Promise.all([
        fetch("/api/wordpress/stats?site=imod"),
        fetch("/api/wordpress/stats?site=ev"),
      ]);
      
      if (imodRes.ok) setImodStats(await imodRes.json());
      if (evRes.ok) setEvStats(await evRes.json());
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPosts = (imodStats?.todayPosts || 0) + (evStats?.todayPosts || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            ภาพรวมของ iMoD Team
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-[#ED2887]">
              {currentTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString("th-TH", { 
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchStats}
            disabled={isLoading}
            className="border-[#ED2887]/30 hover:bg-[#ED2887]/10 hover:border-[#ED2887]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="บทความวันนี้"
          value={totalPosts}
          change="+12% จากเมื่อวาน"
          changeType="up"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="iMoD Posts"
          value={imodStats?.todayPosts || 0}
          description="iphonemod.net"
          icon={<Newspaper className="h-6 w-6" />}
        />
        <StatCard
          title="iMoD Drive"
          value={evStats?.todayPosts || 0}
          description="ev.iphonemod.net"
          icon={<Zap className="h-6 w-6" />}
        />
        <StatCard
          title="ทีมงาน Active"
          value="8"
          description="ออนไลน์ตอนนี้"
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Posts Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">บทความรายสัปดาห์</CardTitle>
              <p className="text-sm text-muted-foreground">เปรียบเทียบ iMoD vs EV</p>
            </div>
            <Activity className="h-5 w-5 text-[#ED2887]" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#38383d" />
                  <XAxis dataKey="name" stroke="#a1a1a6" fontSize={12} />
                  <YAxis stroke="#a1a1a6" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a1f", 
                      border: "1px solid #38383d",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f5f5f7" }}
                  />
                  <Bar dataKey="imod" name="iMoD" fill={COLORS.pink} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ev" name="EV" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Views Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Pageviews รายเดือน</CardTitle>
              <p className="text-sm text-muted-foreground">ยอดวิวรวมทั้ง 2 เว็บ</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#ED2887]" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyViewsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#38383d" />
                  <XAxis dataKey="name" stroke="#a1a1a6" fontSize={12} />
                  <YAxis stroke="#a1a1a6" fontSize={12} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a1f", 
                      border: "1px solid #38383d",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${(value/1000000).toFixed(2)}M`, "Views"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke={COLORS.orange} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Articles - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* iMoD Articles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#ED2887]/20 text-[#ED2887] hover:bg-[#ED2887]/30 border-0">
                  iMoD
                </Badge>
                <CardTitle className="text-lg">บทความล่าสุด</CardTitle>
              </div>
              <Link href="/content">
                <Button variant="ghost" size="sm" className="text-[#ED2887] hover:text-[#ED2887] hover:bg-[#ED2887]/10">
                  ดูทั้งหมด
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#ED2887]" />
                  </div>
                ) : imodStats?.recentPosts?.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-[#ED2887]/10 transition-colors group border border-transparent hover:border-[#ED2887]/30"
                  >
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt=""
                        className="w-16 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                        <Newspaper className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-[#ED2887] transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.date).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* EV Articles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">
                  EV
                </Badge>
                <CardTitle className="text-lg">iMoD Drive</CardTitle>
              </div>
              <Link href="/content">
                <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-500 hover:bg-green-500/10">
                  ดูทั้งหมด
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                  </div>
                ) : evStats?.recentPosts?.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    className="flex gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-green-500/10 transition-colors group border border-transparent hover:border-green-500/30"
                  >
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt=""
                        className="w-16 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-green-500 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.date).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#ED2887]" />
                Content Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1a1a1f", 
                        border: "1px solid #38383d",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="ml-auto font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#ED2887]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/content/news">
                <Button variant="secondary" className="w-full justify-start hover:bg-[#ED2887]/10 hover:text-[#ED2887]">
                  <Newspaper className="h-4 w-4 mr-2" />
                  News Database
                </Button>
              </Link>
              <Link href="/draft">
                <Button variant="secondary" className="w-full justify-start hover:bg-[#ED2887]/10 hover:text-[#ED2887]">
                  <FileText className="h-4 w-4 mr-2" />
                  Draft Generator
                </Button>
              </Link>
              <Link href="/content">
                <Button variant="secondary" className="w-full justify-start hover:bg-[#ED2887]/10 hover:text-[#ED2887]">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Content Hub
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="secondary" className="w-full justify-start hover:bg-[#ED2887]/10 hover:text-[#ED2887]">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#ED2887]" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { event: "SHOKZ Video Draft 2", date: "พรุ่งนี้", type: "deadline" },
                  { event: "Weekly Meeting", date: "จันทร์ 10:00", type: "meeting" },
                  { event: "Content Review", date: "ศุกร์ 14:00", type: "review" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                    <span className="text-sm">{item.event}</span>
                    <Badge 
                      variant="secondary"
                      className={item.type === "deadline" ? "bg-[#cf2e2e]/20 text-[#cf2e2e]" : ""}
                    >
                      {item.date}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
