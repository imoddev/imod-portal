"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Newspaper,
  Plus,
  Search,
  ExternalLink,
  User,
  Clock,
  CheckCircle2,
  Edit3,
  Eye,
  AlertCircle,
  RefreshCw,
  Loader2,
  XCircle,
  Sparkles,
  Database,
  CloudDownload,
} from "lucide-react";

type NewsStatus = "available" | "claimed" | "drafting" | "published" | "skipped";

interface NewsItem {
  id: string;
  date: string;
  time: string;
  source: string;
  category: string;
  title: string;
  sourceUrl: string;
  summary: string;
  selectedBy: string;
  claimedBy: string | null;
  team: string;
  status: NewsStatus;
  publishedAt: string | null;
  notes: string;
}

const statusConfig: Record<NewsStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  available: { label: "ว่าง", color: "text-green-700", bgColor: "bg-green-100", icon: Eye },
  claimed: { label: "จองแล้ว", color: "text-blue-700", bgColor: "bg-blue-100", icon: User },
  drafting: { label: "กำลังเขียน", color: "text-orange-700", bgColor: "bg-orange-100", icon: Edit3 },
  published: { label: "เผยแพร่แล้ว", color: "text-purple-700", bgColor: "bg-purple-100", icon: CheckCircle2 },
  skipped: { label: "ข้าม", color: "text-gray-700", bgColor: "bg-gray-100", icon: XCircle },
};

const categories = ["ทั้งหมด", "Apple", "Android", "EV", "AI", "Gaming", "Tech"];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState<NewsStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<{ total: number; created: number; updated: number } | null>(null);

  // Fetch news from database on mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Fetch news from database
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/news");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setNews(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync from Google Sheet to database
  const syncFromSheet = async () => {
    setIsSyncing(true);
    setSyncStats(null);
    try {
      const response = await fetch("/api/news/sync", { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSyncStats(result.stats);
          // Refresh news list
          await fetchNews();
        }
      }
    } catch (error) {
      console.error("Error syncing news:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Claim news
  const claimNews = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/news/${id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimedBy: "You" }), // TODO: Use real user
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Optimistic update
          setNews(news.map((item) => 
            item.id === id 
              ? { ...item, status: "claimed" as NewsStatus, claimedBy: "You" }
              : item
          ));
        }
      }
    } catch (error) {
      console.error("Error claiming news:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Unclaim news
  const unclaimNews = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unclaim" }),
      });
      
      if (response.ok) {
        // Optimistic update
        setNews(news.map((item) => 
          item.id === id 
            ? { ...item, status: "available" as NewsStatus, claimedBy: null }
            : item
        ));
      }
    } catch (error) {
      console.error("Error unclaiming news:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Update status to drafting
  const startDrafting = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "drafting" }),
      });
      
      if (response.ok) {
        setNews(news.map((item) => 
          item.id === id 
            ? { ...item, status: "drafting" as NewsStatus }
            : item
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Mark as published/completed
  const markAsPublished = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      
      if (response.ok) {
        setNews(news.map((item) => 
          item.id === id 
            ? { ...item, status: "published" as NewsStatus }
            : item
        ));
      }
    } catch (error) {
      console.error("Error marking as published:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ทั้งหมด" || 
                            item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const availableCount = news.filter((n) => n.status === "available").length;
  const claimedCount = news.filter((n) => n.status === "claimed").length;
  const draftingCount = news.filter((n) => n.status === "drafting").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News Dashboard</h1>
          <p className="text-muted-foreground">
            ข่าวจาก Database — จองและเขียนได้เลย
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNews} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" onClick={syncFromSheet} disabled={isSyncing}>
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CloudDownload className="h-4 w-4 mr-2" />
            )}
            Sync จาก Sheet
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มข่าว
          </Button>
        </div>
      </div>

      {/* Sync Stats */}
      {syncStats && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <span className="text-green-800">
            ✅ Sync สำเร็จ! ดึง {syncStats.total} ข่าว — เพิ่มใหม่ {syncStats.created}, อัปเดต {syncStats.updated}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 h-6 px-2" 
            onClick={() => setSyncStats(null)}
          >
            ✕
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedStatus === "available" ? "ring-2 ring-primary" : ""}`} 
          onClick={() => setSelectedStatus(selectedStatus === "available" ? "all" : "available")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-sm text-muted-foreground">ว่างอยู่</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedStatus === "claimed" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "claimed" ? "all" : "claimed")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{claimedCount}</p>
                <p className="text-sm text-muted-foreground">จองแล้ว</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:bg-accent/50 transition-colors ${selectedStatus === "drafting" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "drafting" ? "all" : "drafting")}
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{draftingCount}</p>
                <p className="text-sm text-muted-foreground">กำลังเขียน</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{news.length}</p>
                <p className="text-sm text-muted-foreground">ข่าวทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาข่าว..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        {(selectedStatus !== "all" || selectedCategory !== "ทั้งหมด") && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedStatus("all");
              setSelectedCategory("ทั้งหมด");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* News List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">ยังไม่มีข่าวในฐานข้อมูล</p>
              <p className="mt-1">กด "Sync จาก Sheet" เพื่อดึงข่าวจาก Google Sheets</p>
              <Button className="mt-4" onClick={syncFromSheet} disabled={isSyncing}>
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CloudDownload className="h-4 w-4 mr-2" />
                )}
                Sync เลย
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((item) => {
                const config = statusConfig[item.status] || statusConfig.available;
                const Icon = config.icon;
                const isActionLoading = actionLoading === item.id;
                const displayClaimedBy = item.claimedBy || item.selectedBy;
                
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="font-medium line-clamp-2">{item.title}</p>
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground shrink-0" />
                        </a>
                      </div>
                      {item.summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.summary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{item.category || "General"}</Badge>
                        <span>{item.source}</span>
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.date} {item.time}
                          </span>
                        )}
                        {displayClaimedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {displayClaimedBy}
                          </span>
                        )}
                        {item.team && (
                          <Badge variant="secondary" className="text-xs">
                            {item.team.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`${config.bgColor} ${config.color} border-0`}>
                        {config.label}
                      </Badge>
                      
                      {/* Action Buttons based on status */}
                      {item.status === "available" && (
                        <Button 
                          size="sm" 
                          onClick={() => claimNews(item.id)}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "จองเขียน"
                          )}
                        </Button>
                      )}
                      
                      {item.status === "claimed" && (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => startDrafting(item.id)}
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                เริ่มเขียน
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => unclaimNews(item.id)}
                            disabled={isActionLoading}
                            title="เลิกจอง"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {item.status === "drafting" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/draft?url=${encodeURIComponent(item.sourceUrl)}&title=${encodeURIComponent(item.title)}${item.summary ? `&summary=${encodeURIComponent(item.summary)}` : ""}${item.team ? `&team=${item.team}` : ""}`}>
                              <Edit3 className="h-3 w-3 mr-1" />
                              เปิด Draft
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => markAsPublished(item.id)}
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                เสร็จแล้ว
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredNews.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>ไม่พบข่าวที่ตรงกับเงื่อนไข</p>
                  <Button 
                    variant="ghost" 
                    className="mt-2"
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedCategory("ทั้งหมด");
                      setSearchQuery("");
                    }}
                  >
                    ล้างตัวกรอง
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
