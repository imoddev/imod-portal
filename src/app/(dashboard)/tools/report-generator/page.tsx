"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileBarChart,
  Youtube,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  Send,
  Copy,
  Check,
  ArrowLeft,
  Eye,
  TrendingUp,
  Clock,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
} from "lucide-react";
import Link from "next/link";

interface VideoStats {
  title: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  thumbnail: string;
  channelTitle: string;
}

interface AnalyticsData {
  watchTimeMinutes: number;
  averageViewDuration: string;
  averageViewPercentage: number;
  impressions: number;
  impressionsCtr: number;
  trafficSources: { source: string; views: number; percentage: number }[];
  demographics: { ageGroup: string; percentage: number }[];
  peakViewingTime: string;
}

interface ReportResult {
  reportUrl: string;
  pdfUrl?: string;
  videoStats: VideoStats;
  analytics?: AnalyticsData;
  aiSummary?: string;
}

type ReportStatus = "idle" | "fetching" | "generating" | "done" | "error";

export default function ReportGeneratorPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [language, setLanguage] = useState("th");
  const [dateRange, setDateRange] = useState("lifetime");
  const [template, setTemplate] = useState("v1");
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);
  const [copied, setCopied] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const generateReport = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError("URL ไม่ถูกต้อง กรุณาใส่ลิงก์ YouTube");
      return;
    }

    setStatus("fetching");
    setError("");
    setResult(null);

    try {
      // Fetch video stats
      const statsRes = await fetch("/api/tools/report-generator/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!statsRes.ok) throw new Error("Failed to fetch video stats");
      const { videoStats, analytics } = await statsRes.json();

      setStatus("generating");

      // Generate report
      const reportRes = await fetch("/api/tools/report-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          videoStats,
          analytics,
          language,
          dateRange,
          template,
        }),
      });

      if (!reportRes.ok) throw new Error("Failed to generate report");
      const reportData = await reportRes.json();

      setResult({
        ...reportData,
        videoStats,
        analytics,
      });
      setStatus("done");

    } catch (err) {
      console.error("Report generation error:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setStatus("error");
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart className="h-6 w-6" />
            Report Generator
          </h1>
          <p className="text-muted-foreground">
            สร้างรายงานสถิติ YouTube แบบมืออาชีพ
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          Revenue Team
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-600" />
              สร้างรายงาน
            </CardTitle>
            <CardDescription>
              ใส่ลิงก์วิดีโอ YouTube เพื่อสร้างรายงานสถิติ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video URL */}
            <div className="space-y-2">
              <Label>🎬 Video URL</Label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            {/* Options */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>🌐 ภาษารายงาน</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="th">ภาษาไทย</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>📅 ช่วงเวลา</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifetime">ทั้งหมด</SelectItem>
                    <SelectItem value="7d">7 วันล่าสุด</SelectItem>
                    <SelectItem value="28d">28 วันล่าสุด</SelectItem>
                    <SelectItem value="90d">90 วันล่าสุด</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>🎨 Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">V1 Standard</SelectItem>
                    <SelectItem value="v2">V2 Detailed</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateReport}
              disabled={!videoUrl || status === "fetching" || status === "generating"}
              className="w-full"
              size="lg"
            >
              {status === "fetching" || status === "generating" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileBarChart className="h-4 w-4 mr-2" />
              )}
              {status === "fetching" ? "กำลังดึงข้อมูล..." : 
               status === "generating" ? "กำลังสร้างรายงาน..." : 
               "สร้างรายงาน"}
            </Button>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Warning */}
            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
              ⚠️ รายงานจะถูกเก็บออนไลน์และดูย้อนหลังได้เพียง 15 วันเท่านั้น
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 รายงานประกอบด้วย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span>ยอดวิว & Impressions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>Watch Time & Average View Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Demographics & Traffic Sources</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span>CTR & Engagement Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-pink-600" />
              <span>AI Summary (สรุปโดย AI)</span>
            </div>

            <div className="pt-4 border-t">
              <p className="font-medium mb-2">🎨 Template Features:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• iMoD Brand CI (Pink→Purple)</li>
                <li>• 3 Pages Layout</li>
                <li>• FC Vision Font</li>
                <li>• Export: PDF / LINE / Email</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                สร้างรายงานสำเร็จ!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Thumbnail */}
                <div className="shrink-0">
                  <img
                    src={result.videoStats.thumbnail}
                    alt={result.videoStats.title}
                    className="w-full md:w-80 rounded-lg"
                  />
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold line-clamp-2">
                      {result.videoStats.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.videoStats.channelTitle} • {result.videoStats.publishedAt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Eye className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-xl font-bold">
                        {formatNumber(result.videoStats.viewCount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <ThumbsUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <p className="text-xl font-bold">
                        {formatNumber(result.videoStats.likeCount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <MessageSquare className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-xl font-bold">
                        {formatNumber(result.videoStats.commentCount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                      <p className="text-xl font-bold">
                        {result.videoStats.duration}
                      </p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {result.aiSummary && (
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                      <p className="text-sm font-medium mb-1">🤖 AI Summary:</p>
                      <p className="text-sm text-muted-foreground">
                        {result.aiSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={result.reportUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    ดูรายงาน
                  </a>
                </Button>

                {result.pdfUrl && (
                  <Button variant="outline" asChild>
                    <a href={result.pdfUrl} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => copyLink(result.reportUrl)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Link
                </Button>

                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  ส่ง LINE
                </Button>

                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  ส่ง Email
                </Button>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📎 Report URL: 
                  <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                    {result.reportUrl}
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
