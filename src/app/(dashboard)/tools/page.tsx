"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Wrench,
  Link2,
  Search,
  BarChart3,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Scissors,
  FileBarChart,
  Video,
  Youtube,
  ArrowRight,
  Wand2,
  Palette,
} from "lucide-react";

interface DuplicateResult {
  isDuplicate: boolean;
  confidence: number;
  matchedArticle?: {
    title: string;
    url: string;
    similarity: number;
  };
  similarArticles: { title: string; url: string; similarity: number }[];
}

interface SEOResult {
  score: number;
  grade: string;
  checks: { id: string; name: string; passed: boolean; message: string }[];
  suggestions: string[];
}

export default function ToolsPage() {
  // Short URL state
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [shortCopied, setShortCopied] = useState(false);

  // Duplicate checker state
  const [checkTitle, setCheckTitle] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateResult | null>(null);

  // SEO checker state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoContent, setSeoContent] = useState("");
  const [seoKeyphrase, setSeoKeyphrase] = useState("");
  const [seoMeta, setSeoMeta] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null);

  // Short URL functions
  const createShortUrl = async () => {
    if (!longUrl) return;
    setIsShortening(true);
    setShortUrl("");

    try {
      const response = await fetch("/api/shorturl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: longUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setShortUrl(data.shortUrl);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsShortening(false);
    }
  };

  const copyShortUrl = () => {
    navigator.clipboard.writeText(shortUrl);
    setShortCopied(true);
    setTimeout(() => setShortCopied(false), 2000);
  };

  // Duplicate check functions
  const checkDuplicate = async () => {
    if (!checkTitle) return;
    setIsChecking(true);
    setDuplicateResult(null);

    try {
      const response = await fetch("/api/duplicate/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: checkTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setDuplicateResult(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // SEO check functions
  const analyzeSEO = async () => {
    if (!seoTitle || !seoContent) return;
    setIsAnalyzing(true);
    setSeoResult(null);

    try {
      const response = await fetch("/api/seo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: seoTitle,
          slug: seoTitle.toLowerCase().replace(/\s+/g, "-"),
          content: seoContent,
          focusKeyphrase: seoKeyphrase,
          metaDescription: seoMeta,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSeoResult(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-green-100 text-green-700";
      case "B": return "bg-blue-100 text-blue-700";
      case "C": return "bg-yellow-100 text-yellow-700";
      case "D": return "bg-orange-100 text-orange-700";
      default: return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          Tools
        </h1>
        <p className="text-muted-foreground">
          เครื่องมือช่วยงาน Content & Production
        </p>
      </div>

      {/* Featured Tools */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Long to Short */}
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Scissors className="h-5 w-5 text-purple-600" />
                </div>
                Long to Short
              </CardTitle>
              <Badge className="bg-purple-100 text-purple-700">Production</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              ตัดคลิปยาวเป็น Shorts/Reels อัตโนมัติด้วย AI
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Whisper.cpp ถอดเสียงภาษาไทย</li>
              <li>✓ AI หา highlights อัตโนมัติ</li>
              <li>✓ Face-aware crop 9:16</li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/tools/long-to-short">
                <Video className="h-4 w-4 mr-2" />
                เปิดใช้งาน
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Report Generator */}
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FileBarChart className="h-5 w-5 text-pink-600" />
                </div>
                Report Generator
              </CardTitle>
              <Badge className="bg-pink-100 text-pink-700">Revenue</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              สร้างรายงานสถิติ YouTube แบบมืออาชีพ
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ YouTube Analytics Data</li>
              <li>✓ AI Summary ภาษาไทย</li>
              <li>✓ Export PDF / LINE / Email</li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/tools/report-generator">
                <Youtube className="h-4 w-4 mr-2" />
                เปิดใช้งาน
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Prompt Generator */}
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                </div>
                Prompt Generator
              </CardTitle>
              <Badge className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700">Creative</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              สร้าง AI Prompt สำหรับภาพ Feature Image, YouTube Thumbnail
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Gemini, ChatGPT, Midjourney</li>
              <li>✓ Style Presets พร้อมใช้</li>
              <li>✓ iMoD Brand Guidelines</li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/tools/prompt-generator">
                <Palette className="h-4 w-4 mr-2" />
                เปิดใช้งาน
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Other Tools */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">เครื่องมืออื่นๆ</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Short URL Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Short URL Generator
            </CardTitle>
            <CardDescription>สร้างลิงก์สั้น imods.cc</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL ต้นฉบับ</Label>
              <Input
                placeholder="https://www.iphonemod.net/..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
              />
            </div>
            <Button onClick={createShortUrl} disabled={!longUrl || isShortening}>
              {isShortening ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              สร้างลิงก์สั้น
            </Button>

            {shortUrl && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 font-mono hover:underline"
                  >
                    {shortUrl}
                  </a>
                  <Button variant="ghost" size="sm" onClick={copyShortUrl}>
                    {shortCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Duplicate Checker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Duplicate Checker
            </CardTitle>
            <CardDescription>ตรวจสอบข่าวซ้ำก่อนเขียน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>หัวข้อข่าว</Label>
              <Input
                placeholder="iPhone 17 Pro Max เปิดตัว..."
                value={checkTitle}
                onChange={(e) => setCheckTitle(e.target.value)}
              />
            </div>
            <Button onClick={checkDuplicate} disabled={!checkTitle || isChecking}>
              {isChecking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              ตรวจสอบ
            </Button>

            {duplicateResult && (
              <div className={`p-3 rounded-lg ${
                duplicateResult.isDuplicate ? "bg-red-50" : "bg-green-50"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {duplicateResult.isDuplicate ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  <span className={duplicateResult.isDuplicate ? "text-red-700" : "text-green-700"}>
                    {duplicateResult.isDuplicate 
                      ? `พบข่าวคล้ายกัน (${duplicateResult.confidence}% match)`
                      : "ไม่พบข่าวซ้ำ"}
                  </span>
                </div>

                {duplicateResult.similarArticles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium">บทความที่คล้าย:</p>
                    {duplicateResult.similarArticles.slice(0, 3).map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-white rounded border text-sm hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="line-clamp-1">{article.title}</span>
                          <Badge variant="outline">{article.similarity}%</Badge>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Checker */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              SEO Score Checker
            </CardTitle>
            <CardDescription>ตรวจ SEO ก่อน Publish</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="หัวข้อบทความ"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Keyphrase</Label>
                  <Input
                    placeholder="iPhone 17 Pro Max"
                    value={seoKeyphrase}
                    onChange={(e) => setSeoKeyphrase(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Input
                    placeholder="คำอธิบาย SEO (120-160 ตัวอักษร)"
                    value={seoMeta}
                    onChange={(e) => setSeoMeta(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <textarea
                    placeholder="เนื้อหาบทความ..."
                    value={seoContent}
                    onChange={(e) => setSeoContent(e.target.value)}
                    className="w-full p-3 border rounded-md text-sm h-32 resize-none"
                  />
                </div>
                <Button onClick={analyzeSEO} disabled={!seoTitle || !seoContent || isAnalyzing}>
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4 mr-2" />
                  )}
                  วิเคราะห์ SEO
                </Button>
              </div>

              {/* SEO Result */}
              <div>
                {seoResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getGradeColor(seoResult.grade)}`}>
                        {seoResult.grade}
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{seoResult.score}/100</p>
                        <p className="text-sm text-muted-foreground">SEO Score</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {seoResult.checks.map((check) => (
                        <div
                          key={check.id}
                          className={`p-2 rounded text-sm flex items-center gap-2 ${
                            check.passed ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          {check.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                          )}
                          <span className={check.passed ? "text-green-700" : "text-red-700"}>
                            {check.message}
                          </span>
                        </div>
                      ))}
                    </div>

                    {seoResult.suggestions.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium text-yellow-800 mb-2">💡 ข้อเสนอแนะ:</p>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                          {seoResult.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>กรอกข้อมูลแล้วกด "วิเคราะห์ SEO"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
