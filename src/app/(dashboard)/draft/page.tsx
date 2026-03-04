"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileEdit,
  Wand2,
  Copy,
  Check,
  Globe,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Youtube,
  Link,
  Sparkles,
  User,
  Settings,
  Mic,
  FileText,
  Megaphone,
  Smile,
  Users,
  GraduationCap,
  Zap,
  MessageSquare,
  ClipboardCopy,
  Send,
  Rocket,
  Star,
} from "lucide-react";

interface DraftOutput {
  title: string;
  slug: string;
  excerpt: string;
  focusKeyphrase: string;
  metaDescription: string;
  categories: string[];
  tags: string[];
  content: string;
}

// Source Types
const sourceTypes = [
  { id: "web", label: "จากเว็บไซต์", icon: Globe, placeholder: "https://9to5mac.com/..." },
  { id: "youtube", label: "จาก YouTube", icon: Youtube, placeholder: "https://youtube.com/watch?v=..." },
  { id: "transcript", label: "จาก Transcript", icon: FileText, placeholder: "วาง transcript ที่นี่..." },
  { id: "audio", label: "จาก Audio/Podcast", icon: Mic, placeholder: "https://..." },
];

// Writing Styles
const writingStyles = [
  { 
    id: "attapon", 
    label: "สไตล์พี่ต้อม", 
    icon: Star, 
    description: "กึ่งทางการ เพื่อนสอนเพื่อน SEO เขียว Tags 5+ Internal Links",
    color: "bg-orange-100 text-orange-700",
  },
  { 
    id: "standard", 
    label: "มาตรฐาน", 
    icon: FileText, 
    description: "รูปแบบข่าวทั่วไป กระชับ ตรงประเด็น",
    color: "bg-blue-100 text-blue-700",
  },
  { 
    id: "pr", 
    label: "PR News", 
    icon: Megaphone, 
    description: "รูปแบบข่าว PR เน้นจุดเด่นสินค้า",
    color: "bg-purple-100 text-purple-700",
  },
  { 
    id: "fun", 
    label: "สนุกสนาน", 
    icon: Smile, 
    description: "เล่าแบบสนุก มีอารมณ์ขัน",
    color: "bg-yellow-100 text-yellow-700",
  },
  { 
    id: "friendly", 
    label: "แบบเพื่อน", 
    icon: Users, 
    description: "คุยเหมือนเพื่อนเล่าให้ฟัง",
    color: "bg-green-100 text-green-700",
  },
  { 
    id: "formal", 
    label: "ทางการ", 
    icon: GraduationCap, 
    description: "ภาษาทางการ เหมาะกับข่าวธุรกิจ",
    color: "bg-gray-100 text-gray-700",
  },
  { 
    id: "quick", 
    label: "สรุปสั้น", 
    icon: Zap, 
    description: "สรุปใจความสำคัญ 2-3 ย่อหน้า",
    color: "bg-orange-100 text-orange-700",
  },
];

// Mock user custom styles (in production, fetch from API)
const userCustomStyles = [
  { 
    id: "thitirath", 
    label: "สไตล์พี่เต็นท์", 
    icon: User, 
    description: "ตามกฎ 14 ข้อ, ใช้ มี.ค. แทน เดือนมีนาคม",
    color: "bg-pink-100 text-pink-700",
    author: "Thitirath Kinaret",
  },
  { 
    id: "sakura", 
    label: "สไตล์พี่ซา", 
    icon: User, 
    description: "เน้น EV, รายละเอียดสเปค",
    color: "bg-teal-100 text-teal-700",
    author: "Zakura Kim",
  },
];

// AI Models for generation
const aiModels = [
  {
    id: "qwen-local",
    label: "Qwen 3 8B",
    description: "Local, ฟรี, คุณภาพดี",
    icon: Zap,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "qwen-fast",
    label: "Qwen 3 4B",
    description: "Local, ฟรี, เร็ว",
    icon: Zap,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "claude-sonnet",
    label: "Claude Sonnet 4.5",
    description: "Anthropic, คุณภาพสูงสุด",
    icon: Sparkles,
    color: "bg-violet-100 text-violet-700",
  },
];

// Thitirath Checklist (14 ข้อ)
const checklist = [
  { id: 1, label: "หัวข้อชัดเจน สื่อความหมาย" },
  { id: 2, label: "Slug ภาษาอังกฤษ lowercase" },
  { id: 3, label: "มี <!--more--> หลัง paragraph แรก" },
  { id: 4, label: "Focus keyphrase ตั้งแล้ว" },
  { id: 5, label: "Meta description มีครบ" },
  { id: 6, label: "Categories ที่เกี่ยวข้อง" },
  { id: 7, label: "Tags ที่เกี่ยวข้อง" },
  { id: 8, label: "รูปภาพมี Alt text" },
  { id: 9, label: "ใช้ มี.ค. แทน เดือนมีนาคม" },
  { id: 10, label: "H2 ไม่เกิน 1 อัน" },
  { id: 11, label: "ลด Bold ให้น้อยที่สุด" },
  { id: 12, label: "แหล่งที่มาครบถ้วน" },
  { id: 13, label: "ตรวจ typo แล้ว" },
  { id: 14, label: "Preview แล้ว" },
];

type TabType = "generate" | "prompt";

function DraftContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [sourceType, setSourceType] = useState("web");
  const [sourceInput, setSourceInput] = useState("");
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [site, setSite] = useState<"imod" | "imoddrive">("imod");
  const [selectedStyle, setSelectedStyle] = useState("standard");
  const [selectedModel, setSelectedModel] = useState("qwen-local");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isFetchingSource, setIsFetchingSource] = useState(false);
  const [draft, setDraft] = useState<DraftOutput | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState<{ success: boolean; editUrl?: string; error?: string } | null>(null);
  const [author, setAuthor] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Load URL params on mount
  useEffect(() => {
    const urlParam = searchParams.get("url");
    const titleParam = searchParams.get("title");
    const summaryParam = searchParams.get("summary");
    const teamParam = searchParams.get("team");
    
    if (urlParam) {
      setSourceInput(urlParam);
      setSourceType("web");
      
      // Auto-detect site from URL or team param
      if (teamParam === "ev" || urlParam.includes("ev.") || urlParam.includes("electrek") || urlParam.includes("insideevs")) {
        setSite("imoddrive");
      }
    }
    if (titleParam) {
      setNewsTitle(titleParam);
    }
    if (summaryParam) {
      setNewsSummary(summaryParam);
    }
  }, [searchParams]);

  const currentSource = sourceTypes.find((s) => s.id === sourceType);
  const allStyles = [...writingStyles, ...userCustomStyles];
  const currentStyle = allStyles.find((s) => s.id === selectedStyle);

  // Generate prompt for external AI
  const generatePrompt = () => {
    const siteName = site === "imod" ? "iMoD (iphonemod.net)" : "iMoD Drive (ev.iphonemod.net)";
    const styleInfo = currentStyle ? `\n- สไตล์การเขียน: ${currentStyle.label} (${currentStyle.description})` : "";
    
    let styleRules = "";
    if (selectedStyle === "thitirath") {
      styleRules = `
## กฎการเขียน (สไตล์พี่เต็นท์)
1. ใช้ "มี.ค." แทน "เดือนมีนาคม" (ย่อชื่อเดือน)
2. H2 ใช้ได้แค่ 1 อัน
3. ลด Bold ให้น้อยที่สุด
4. มี <!--more--> หลัง paragraph แรก
5. ระบุแหล่งที่มาท้ายบทความ`;
    } else if (selectedStyle === "pr") {
      styleRules = `
## กฎการเขียน (PR News)
- เน้นจุดเด่นของสินค้า/บริการ
- ใช้ภาษาที่สร้างความน่าสนใจ
- ระบุราคาและช่องทางการจำหน่าย (ถ้ามี)`;
    } else if (selectedStyle === "fun") {
      styleRules = `
## กฎการเขียน (สนุกสนาน)
- ใช้ภาษาเป็นกันเอง มีอารมณ์ขัน
- ใส่ emoji ได้พอประมาณ
- เล่าเรื่องแบบมีชีวิตชีวา`;
    } else if (selectedStyle === "friendly") {
      styleRules = `
## กฎการเขียน (แบบเพื่อน)
- เขียนเหมือนเพื่อนเล่าให้ฟัง
- ใช้ภาษาพูดได้
- ตั้งคำถามกับผู้อ่าน`;
    } else if (selectedStyle === "formal") {
      styleRules = `
## กฎการเขียน (ทางการ)
- ใช้ภาษาทางการ
- หลีกเลี่ยงคำแสลง
- เหมาะกับข่าวธุรกิจ/องค์กร`;
    } else if (selectedStyle === "quick") {
      styleRules = `
## กฎการเขียน (สรุปสั้น)
- สรุปใจความสำคัญ 2-3 ย่อหน้า
- ใช้ bullet points
- ตัดรายละเอียดที่ไม่จำเป็นออก`;
    }

    const prompt = `# คำสั่งเขียนบทความข่าว

## ข้อมูลพื้นฐาน
- เว็บไซต์: ${siteName}
- ประเภทแหล่งข้อมูล: ${currentSource?.label}${styleInfo}

## แหล่งข้อมูล
${sourceType === "transcript" ? sourceInput : `URL: ${sourceInput}`}
${styleRules}

## สิ่งที่ต้องการ
กรุณาสร้างบทความข่าวภาษาไทยจากข้อมูลด้านบน โดยให้มี:

1. **Title** - หัวข้อข่าวที่ดึงดูด (ภาษาไทย)
2. **Slug** - URL-friendly slug (ภาษาอังกฤษ, lowercase, ใช้ขีด - คั่น)
3. **Excerpt** - สรุปย่อ 1-2 ประโยค
4. **Focus Keyphrase** - คำค้นหาหลัก
5. **Meta Description** - คำอธิบายสำหรับ SEO (ไม่เกิน 160 ตัวอักษร)
6. **Categories** - หมวดหมู่ที่เกี่ยวข้อง
7. **Tags** - แท็กที่เกี่ยวข้อง
8. **Content** - เนื้อหาบทความฉบับเต็ม (มี <!--more--> หลัง paragraph แรก)

## รูปแบบ Output
ให้ตอบในรูปแบบนี้:

\`\`\`
Title: [หัวข้อ]
Slug: [slug]
Excerpt: [สรุปย่อ]
Focus Keyphrase: [คำค้นหา]
Meta Description: [คำอธิบาย SEO]
Categories: [หมวดหมู่1, หมวดหมู่2]
Tags: [แท็ก1, แท็ก2, แท็ก3]

---CONTENT---
[เนื้อหาบทความ]
\`\`\``;

    return prompt;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt());
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const postToWordPress = async () => {
    if (!draft) return;
    
    setIsPosting(true);
    setPostResult(null);
    
    try {
      const response = await fetch("/api/wordpress/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site,
          title: draft.title,
          content: draft.content,
          excerpt: draft.excerpt,
          slug: draft.slug,
          focusKeyphrase: draft.focusKeyphrase,
          metaDescription: draft.metaDescription,
          categories: draft.categories,
          tags: draft.tags,
          sourceUrl: sourceInput,
          notify: true,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setPostResult({ success: true, editUrl: result.editUrl });
      } else {
        setPostResult({ success: false, error: result.error });
      }
    } catch (error) {
      setPostResult({ success: false, error: "Network error" });
    } finally {
      setIsPosting(false);
    }
  };

  const generateDraft = async () => {
    if (!sourceInput) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    setDraft(null);
    
    try {
      const response = await fetch("/api/draft/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: sourceInput,
          title: newsTitle || "",
          summary: newsSummary || "",
          style: selectedStyle,
          site: site,
          model: selectedModel,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setGenerationError(result.error || "Generation failed");
        return;
      }
      
      // Set the draft from AI response
      setDraft({
        title: result.draft.title || "",
        slug: result.draft.slug || "",
        excerpt: result.draft.excerpt || "",
        focusKeyphrase: result.draft.focusKeyphrase || "",
        metaDescription: result.draft.metaDescription || "",
        categories: result.draft.categories || [],
        tags: result.draft.tags || [],
        content: result.draft.content || "",
      });
      
      // Auto-check some items based on style
      if (selectedStyle === "thitirath") {
        setCheckedItems([1, 2, 3, 4, 5, 6, 7, 9, 10, 11]);
      } else {
        setCheckedItems([1, 2, 3, 4, 5, 6, 7]);
      }
    } catch (error) {
      setGenerationError(`Network error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // State for command
  const [commandText, setCommandText] = useState("");
  const [commandCopied, setCommandCopied] = useState(false);

  // Generate command for AI Agent
  const generateCommand = async () => {
    if (!sourceInput) return;
    
    setIsDispatching(true);
    setDispatchResult(null);
    setCommandText("");
    
    try {
      const response = await fetch("/api/draft/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsTitle || "News Article",
          sourceUrl: sourceInput,
          site: site,
          author: author || "ไม่ระบุ",
          style: selectedStyle,
          model: selectedModel,
          agent: "marcus",
          summary: newsSummary || "",
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCommandText(result.copyText);
        setDispatchResult({ 
          success: true, 
          message: `สร้างคำสั่งแล้ว! Copy ไป paste ใน ${result.command.channelName}` 
        });
      } else {
        setDispatchResult({ success: false, error: result.error });
      }
    } catch (error) {
      setDispatchResult({ success: false, error: `Network error: ${error}` });
    } finally {
      setIsDispatching(false);
    }
  };

  // Copy command to clipboard
  const copyCommand = () => {
    navigator.clipboard.writeText(commandText);
    setCommandCopied(true);
    setTimeout(() => setCommandCopied(false), 2000);
  };

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const allChecked = checkedItems.length === checklist.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileEdit className="h-6 w-6" />
            Draft Generator
          </h1>
          <p className="text-muted-foreground">
            สร้าง Draft บทความจากแหล่งข้อมูลต่างๆ
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/settings/writing-style">
            <Settings className="h-4 w-4 mr-2" />
            ตั้งค่า Style
          </a>
        </Button>
      </div>

      {/* Tab Selection */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === "generate" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("generate")}
        >
          <Send className="h-4 w-4 mr-2" />
          ส่งงาน AI Agent
        </Button>
        <Button
          variant={activeTab === "prompt" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("prompt")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          สร้าง Prompt (Manual)
        </Button>
      </div>

      {/* News Info (from URL params) */}
      {(newsTitle || sourceInput) && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-blue-600" />
              ข้อมูลข่าวที่เลือก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {newsTitle && (
              <div>
                <Label className="text-xs text-muted-foreground">หัวข้อ</Label>
                <p className="font-medium">{newsTitle}</p>
              </div>
            )}
            {newsSummary && (
              <div>
                <Label className="text-xs text-muted-foreground">สรุป</Label>
                <p className="text-sm text-muted-foreground">{newsSummary}</p>
              </div>
            )}
            {sourceInput && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">แหล่งที่มา:</Label>
                <a href={sourceInput} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate max-w-md">
                  {sourceInput}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Source Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. เลือกแหล่งที่มา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {sourceTypes.map((source) => {
              const Icon = source.icon;
              return (
                <Button
                  key={source.id}
                  variant={sourceType === source.id ? "default" : "outline"}
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => {
                    setSourceType(source.id);
                    if (source.id !== "web") setSourceInput("");
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{source.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label>{currentSource?.label}</Label>
            {sourceType === "transcript" ? (
              <textarea
                placeholder={currentSource?.placeholder}
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                className="w-full p-3 border rounded-md text-sm h-32 resize-none"
              />
            ) : (
              <Input
                placeholder={currentSource?.placeholder}
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
              />
            )}
          </div>

          <div className="flex gap-2">
            <div className="space-y-2">
              <Label>เว็บไซต์ปลายทาง</Label>
              <div className="flex gap-2">
                <Button
                  variant={site === "imod" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSite("imod")}
                >
                  iMoD
                </Button>
                <Button
                  variant={site === "imoddrive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSite("imoddrive")}
                >
                  iMoD Drive
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            2. เลือกสไตล์การเขียน
          </CardTitle>
          <CardDescription>
            เลือกรูปแบบการเขียนที่ต้องการ หรือใช้สไตล์ที่คุณ train ไว้
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Standard Styles */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">รูปแบบทั่วไป</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {writingStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStyle === style.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className={`inline-flex p-1.5 rounded ${style.color} mb-2`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="font-medium text-sm">{style.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Custom Styles */}
          {userCustomStyles.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                สไตล์ที่ Train ไว้
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {userCustomStyles.map((style) => {
                  const Icon = style.icon;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedStyle === style.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`inline-flex p-1.5 rounded ${style.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className="text-xs">Trained</Badge>
                      </div>
                      <p className="font-medium text-sm">{style.label}</p>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">โดย {style.author}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Style Info */}
          {currentStyle && (
            <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">
                  สไตล์ที่เลือก: {currentStyle.label}
                </p>
                <p className="text-xs text-muted-foreground">{currentStyle.description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            3. เลือก AI Model
          </CardTitle>
          <CardDescription>
            เลือก AI ที่จะใช้วิเคราะห์และแปลบทความ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiModels.map((model) => {
              const Icon = model.icon;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedModel === model.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${model.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{model.label}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Selected Model Info */}
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">
                AI ที่เลือก: {aiModels.find(m => m.id === selectedModel)?.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedModel.includes("qwen") ? "รันบนเครื่อง (Ollama)" : "Anthropic API"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Author & Dispatch */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            4. ระบุผู้เขียนและส่งงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ผู้เขียน (Author)</Label>
            <Input
              placeholder="ชื่อผู้เขียน เช่น พี่เต็นท์, พี่ซา"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          
          {/* Generate Command Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={generateCommand}
              disabled={!sourceInput || isDispatching}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              {isDispatching ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-5 w-5 mr-2" />
              )}
              {isDispatching ? "กำลังสร้าง..." : "สร้างคำสั่งสำหรับ AI Agent"}
            </Button>
          </div>
          
          {/* Dispatch Result */}
          {dispatchResult && (
            <div className={`p-3 rounded-lg ${dispatchResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              {dispatchResult.success ? (
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{dispatchResult.message}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span>{dispatchResult.error}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Generated Command */}
          {commandText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">คำสั่งสำหรับ Discord</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCommand}
                  className="gap-2"
                >
                  {commandCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                {commandText}
              </div>
              <p className="text-sm text-muted-foreground">
                📋 Copy คำสั่งด้านบน แล้วไป paste ใน Discord ห้อง {site === "imoddrive" ? "#imoddrive" : "#content-team"}
              </p>
            </div>
          )}
          
          {/* Summary of what will be sent */}
          {sourceInput && (
            <div className="p-3 bg-violet-50 rounded-lg text-sm">
              <p className="font-medium text-violet-800 mb-2">📝 Preview คำสั่งที่จะส่ง:</p>
              <ul className="space-y-1 text-violet-700">
                <li>• หัวข้อ: {newsTitle || "News Article"}</li>
                <li>• URL: {sourceInput.substring(0, 50)}...</li>
                <li>• เว็บไซต์: {site === "imoddrive" ? "iMoD Drive" : "iMoD"}</li>
                <li>• สไตล์: {allStyles.find(s => s.id === selectedStyle)?.label}</li>
                <li>• Model: {aiModels.find(m => m.id === selectedModel)?.label}</li>
                <li>• ส่งไปห้อง: {site === "imoddrive" ? "#imoddrive" : "#content-team"}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === "prompt" ? (
        /* Prompt Generator Tab */
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompt สำหรับ AI
            </CardTitle>
            <CardDescription>
              Copy prompt นี้ไปใช้กับ ChatGPT, Claude หรือ AI อื่นๆ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sourceInput ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>กรุณาใส่ URL หรือข้อมูลแหล่งที่มาก่อน</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <textarea
                    value={generatePrompt()}
                    readOnly
                    className="w-full p-4 border rounded-lg text-sm h-96 resize-none font-mono bg-muted/50"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={copyPrompt} size="lg">
                    {promptCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 วิธีใช้</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Copy prompt ด้านบน</li>
                    <li>ไปที่ ChatGPT, Claude หรือ AI ที่ต้องการ</li>
                    <li>Paste และส่ง</li>
                    <li>Copy ผลลัพธ์กลับมาใส่ WordPress</li>
                  </ol>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Generate Draft Tab - Now just shows instructions */
        <>
          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">วิธีใช้งาน</p>
                  <p className="text-sm text-blue-600 mt-1">
                    กรอกข้อมูลด้านบน แล้วกด "สร้างคำสั่งสำหรับ AI Agent" ในส่วนที่ 4
                    <br />จากนั้น Copy คำสั่งไป paste ใน Discord เพื่อให้ AI Agent เขียนบทความให้
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Error (if any) */}
          {generationError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">เกิดข้อผิดพลาด</p>
                    <p className="text-sm text-red-600 mt-1">{generationError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setGenerationError(null)}
                    >
                      ปิด
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draft Output */}
          {draft && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Generated Draft */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Draft Output</CardTitle>
                      <Badge className={currentStyle?.color}>{currentStyle?.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Title</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(draft.title, "title")}
                        >
                          {copied === "title" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <Input value={draft.title} readOnly className="font-medium" />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Slug</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(draft.slug, "slug")}
                        >
                          {copied === "slug" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <Input value={draft.slug} readOnly className="font-mono text-sm" />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Excerpt</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(draft.excerpt, "excerpt")}
                        >
                          {copied === "excerpt" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <textarea
                        value={draft.excerpt}
                        readOnly
                        className="w-full p-2 border rounded-md text-sm h-20 resize-none"
                      />
                    </div>

                    {/* Focus Keyphrase */}
                    <div className="space-y-2">
                      <Label>Focus Keyphrase</Label>
                      <Input value={draft.focusKeyphrase} readOnly />
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Meta Description ({draft.metaDescription.length}/160)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(draft.metaDescription, "meta")}
                        >
                          {copied === "meta" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <textarea
                        value={draft.metaDescription}
                        readOnly
                        className="w-full p-2 border rounded-md text-sm h-16 resize-none"
                      />
                    </div>

                    {/* Categories & Tags */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="flex flex-wrap gap-1">
                          {draft.categories.map((cat) => (
                            <Badge key={cat}>{cat}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-1">
                          {draft.tags.map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Content</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(draft.content, "content")}
                        >
                          {copied === "content" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <textarea
                        value={draft.content}
                        readOnly
                        className="w-full p-2 border rounded-md text-sm h-64 resize-none font-mono"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Checklist</span>
                    <Badge variant={allChecked ? "default" : "secondary"}>
                      {checkedItems.length}/{checklist.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>ตรวจสอบก่อน Publish</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklist.map((item) => {
                      const isChecked = checkedItems.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                            isChecked
                              ? "bg-green-50 text-green-700"
                              : "hover:bg-accent"
                          }`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 border rounded shrink-0" />
                          )}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {allChecked && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-700 font-medium">พร้อม Publish!</p>
                    </div>
                  )}

                  {/* Post to WordPress */}
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={postToWordPress}
                      disabled={isPosting || !draft}
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          กำลังส่ง...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          ส่งไป WordPress (Draft)
                        </>
                      )}
                    </Button>

                    {postResult && (
                      <div className={`p-3 rounded-lg text-sm ${
                        postResult.success 
                          ? "bg-green-50 text-green-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {postResult.success ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 inline mr-2" />
                            สร้าง Draft สำเร็จ!
                            {postResult.editUrl && (
                              <a 
                                href={postResult.editUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block mt-2 underline"
                              >
                                เปิดใน WordPress →
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            {postResult.error || "เกิดข้อผิดพลาด"}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DraftPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DraftContent />
    </Suspense>
  );
}
