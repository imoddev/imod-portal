"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart2,
  TrendingUp,
  FileText,
  Users,
  Tag,
  Folder,
  Loader2,
  ExternalLink,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ContentStats {
  totalArticles: number;
  avgPerDay: number;
  uniqueAuthors: number;
  uniqueCategories: number;
}

interface WriterStats {
  totalArticles: number;
  articlesThisPeriod: number;
  avgPerDay: number;
}

const COLORS = ["#ED2887", "#612BAE", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AnalyticsPage() {
  const [site, setSite] = useState("imod");
  const [period, setPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  
  // Content analytics
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [topAuthors, setTopAuthors] = useState<{ name: string; count: number }[]>([]);
  const [topCategories, setTopCategories] = useState<{ name: string; count: number }[]>([]);
  const [topTags, setTopTags] = useState<{ name: string; count: number }[]>([]);
  const [dailyTrend, setDailyTrend] = useState<{ date: string; count: number }[]>([]);
  
  // Writer analytics
  const [writerStats, setWriterStats] = useState<WriterStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [writerCategories, setWriterCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetchContentAnalytics();
  }, [site, period]);

  const fetchContentAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch content analytics
      const contentRes = await fetch(`/api/analytics/content?site=${site}&period=${period}`);
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContentStats(data.stats);
        setTopAuthors(data.topAuthors || []);
        setTopCategories(data.topCategories || []);
        setTopTags(data.topTags || []);
        setDailyTrend(data.dailyTrend || []);
      }

      // Fetch writer analytics (for current user - mock with attapon for now)
      const writerRes = await fetch(`/api/analytics/writer?authorId=1&site=${site}&period=${period}`);
      if (writerRes.ok) {
        const data = await writerRes.json();
        setWriterStats(data.stats);
        setRecentArticles(data.recentArticles || []);
        setWriterCategories(data.topCategories || []);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Content Analytics
          </h1>
          <p className="text-muted-foreground">
            วิเคราะห์ผลงานและประสิทธิภาพ
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={site} onValueChange={setSite}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imod">iMoD</SelectItem>
              <SelectItem value="imoddrive">iMoD Drive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 วันที่ผ่านมา</SelectItem>
              <SelectItem value="month">เดือนนี้</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">บทความทั้งหมด</p>
                    <p className="text-3xl font-bold">{contentStats?.totalArticles || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">เฉลี่ย/วัน</p>
                    <p className="text-3xl font-bold text-green-500">{contentStats?.avgPerDay || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">นักเขียน</p>
                    <p className="text-3xl font-bold text-blue-500">{contentStats?.uniqueAuthors || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                    <p className="text-3xl font-bold text-purple-500">{contentStats?.uniqueCategories || 0}</p>
                  </div>
                  <Folder className="h-8 w-8 text-purple-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
              <TabsTrigger value="writers">นักเขียน</TabsTrigger>
              <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
              <TabsTrigger value="my-stats">ผลงานของฉัน</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Daily Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>บทความรายวัน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyTrend.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(v) => new Date(v).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(v) => new Date(v).toLocaleDateString("th-TH")}
                          />
                          <Line type="monotone" dataKey="count" stroke="#ED2887" strokeWidth={2} name="บทความ" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Top Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tags ยอดนิยม
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {topTags.slice(0, 20).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          {tag.name} ({tag.count})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Writers Tab */}
            <TabsContent value="writers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ผลงานรายนักเขียน</CardTitle>
                </CardHeader>
                <CardContent>
                  {topAuthors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={topAuthors} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ED2887" name="บทความ" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>หมวดหมู่ยอดนิยม</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topCategories.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={topCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
                          >
                            {topCategories.map((entry, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>รายละเอียดหมวดหมู่</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topCategories.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                            <span className="font-medium">{cat.name}</span>
                          </div>
                          <Badge variant="secondary">{cat.count} บทความ</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* My Stats Tab */}
            <TabsContent value="my-stats" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>บทความล่าสุดของฉัน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentArticles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">ไม่มีบทความ</div>
                    ) : (
                      <div className="space-y-3">
                        {recentArticles.map((article, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{article.title}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(article.date).toLocaleDateString("th-TH")}
                              </p>
                            </div>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>สรุปผลงาน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 text-center">
                      <p className="text-3xl font-bold text-primary">{writerStats?.articlesThisPeriod || 0}</p>
                      <p className="text-sm text-muted-foreground">บทความช่วงนี้</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-2xl font-bold">{(writerStats?.avgPerDay || 0).toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">เฉลี่ย/วัน</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">หมวดที่เขียนบ่อย</p>
                      {writerCategories.slice(0, 5).map((cat, i) => (
                        <Badge key={i} variant="outline" className="mr-2">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
