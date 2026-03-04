"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sparkles,
  Image,
  Youtube,
  Copy,
  Check,
  ArrowLeft,
  Wand2,
  Palette,
  Layout,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Prompt categories
const categories = [
  { id: "feature-image", name: "Feature Image", icon: Image, description: "รูปประกอบบทความ" },
  { id: "youtube-thumb", name: "YouTube Thumbnail", icon: Youtube, description: "ภาพปกคลิป YouTube" },
  { id: "social-post", name: "Social Post", icon: Layout, description: "รูปโพสต์ Social Media" },
  { id: "product-shot", name: "Product Shot", icon: Palette, description: "ภาพสินค้า/อุปกรณ์" },
];

// AI tools supported
const aiTools = [
  { id: "gemini", name: "Gemini", color: "bg-blue-100 text-blue-700" },
  { id: "chatgpt", name: "ChatGPT/DALL-E", color: "bg-green-100 text-green-700" },
  { id: "midjourney", name: "Midjourney", color: "bg-purple-100 text-purple-700" },
  { id: "veo3", name: "Veo3", color: "bg-red-100 text-red-700" },
  { id: "kling", name: "Kling", color: "bg-orange-100 text-orange-700" },
];

// Style presets
const stylePresets = {
  "feature-image": [
    { id: "tech-modern", name: "Tech Modern", prompt: "modern minimalist tech style, clean background, soft lighting, professional" },
    { id: "gradient-bg", name: "Gradient Background", prompt: "colorful gradient background, product floating, soft shadows, 3D render" },
    { id: "lifestyle", name: "Lifestyle", prompt: "lifestyle photography, person using device, natural lighting, bokeh" },
    { id: "abstract", name: "Abstract Tech", prompt: "abstract technology concept, futuristic, neon accents, dark background" },
  ],
  "youtube-thumb": [
    { id: "reaction", name: "Reaction Style", prompt: "YouTube thumbnail style, expressive face, bold text overlay, high contrast" },
    { id: "versus", name: "VS Comparison", prompt: "comparison thumbnail, split screen, vs symbol, dramatic lighting" },
    { id: "unboxing", name: "Unboxing", prompt: "product reveal, hands holding device, clean background, excitement" },
    { id: "review", name: "Review Style", prompt: "review thumbnail, product focus, rating visual, professional" },
  ],
  "social-post": [
    { id: "instagram", name: "Instagram", prompt: "Instagram post style, square format, vibrant colors, lifestyle aesthetic" },
    { id: "twitter", name: "Twitter/X", prompt: "Twitter card style, 16:9 ratio, clean design, informative" },
    { id: "facebook", name: "Facebook", prompt: "Facebook post, engaging visual, text overlay, shareable" },
  ],
  "product-shot": [
    { id: "studio", name: "Studio Shot", prompt: "studio product photography, white background, soft box lighting, high detail" },
    { id: "floating", name: "Floating", prompt: "floating product, gradient background, dynamic angles, 3D render" },
    { id: "contextual", name: "In Context", prompt: "product in use, real environment, lifestyle context, natural" },
  ],
};

// Template prompts
const promptTemplates = {
  "feature-image": {
    base: "Create a professional feature image for a tech article about {{topic}}. {{style}}. High resolution, 16:9 aspect ratio, suitable for web article header.",
    tips: [
      "ระบุอุปกรณ์/หัวข้อให้ชัดเจน",
      "เลือก style ที่ตรงกับ tone ของบทความ",
      "ใช้ negative prompt เพื่อลบสิ่งที่ไม่ต้องการ",
    ],
  },
  "youtube-thumb": {
    base: "Create an eye-catching YouTube thumbnail for a video about {{topic}}. {{style}}. Bold, attention-grabbing, 1920x1080 resolution, leave space for text.",
    tips: [
      "เว้นพื้นที่สำหรับใส่ text overlay",
      "ใช้สีตัดกันสูง เพื่อดึงความสนใจ",
      "หน้าคนหรืออุปกรณ์ควรอยู่ 1/3 ของภาพ",
    ],
  },
  "social-post": {
    base: "Design a social media post image about {{topic}}. {{style}}. Engaging visual that encourages interaction, optimized for {{platform}}.",
    tips: [
      "เลือก format ตรงกับ platform",
      "ทำให้ดูน่า scroll หยุด",
      "สีควรสดใส แต่ไม่ลาย",
    ],
  },
  "product-shot": {
    base: "Generate a professional product image of {{topic}}. {{style}}. High quality, showcasing key features, commercial photography level.",
    tips: [
      "ระบุมุมกล้องที่ต้องการ",
      "บอก features ที่อยากเน้น",
      "ถ้าเป็นอุปกรณ์จริง ควรใส่รุ่นให้ชัด",
    ],
  },
};

export default function PromptGeneratorPage() {
  const [category, setCategory] = useState("feature-image");
  const [selectedTool, setSelectedTool] = useState("midjourney");
  const [topic, setTopic] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const currentStyles = stylePresets[category as keyof typeof stylePresets] || [];
  const currentTemplate = promptTemplates[category as keyof typeof promptTemplates];

  const generatePrompt = () => {
    if (!topic) return;

    const style = selectedStyle 
      ? currentStyles.find(s => s.id === selectedStyle)?.prompt || ""
      : customStyle;

    let prompt = currentTemplate.base
      .replace("{{topic}}", topic)
      .replace("{{style}}", style)
      .replace("{{platform}}", "Instagram"); // Default

    // Add tool-specific formatting
    if (selectedTool === "midjourney") {
      prompt = `${prompt} --ar 16:9 --v 6 --style raw`;
      if (negativePrompt) {
        prompt += ` --no ${negativePrompt}`;
      }
    } else if (selectedTool === "chatgpt") {
      if (negativePrompt) {
        prompt += `\n\nAvoid: ${negativePrompt}`;
      }
    } else if (selectedTool === "gemini") {
      prompt = `Generate image: ${prompt}`;
      if (negativePrompt) {
        prompt += `\nDo not include: ${negativePrompt}`;
      }
    }

    setGeneratedPrompt(prompt);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const randomizeStyle = () => {
    const randomIndex = Math.floor(Math.random() * currentStyles.length);
    setSelectedStyle(currentStyles[randomIndex].id);
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
            <Wand2 className="h-6 w-6" />
            Prompt Generator
          </h1>
          <p className="text-muted-foreground">
            สร้าง AI Prompt สำหรับทีม Content
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {aiTools.map((tool) => (
            <Badge
              key={tool.id}
              className={`cursor-pointer ${
                selectedTool === tool.id 
                  ? tool.color 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedTool(tool.id)}
            >
              {tool.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">เลือกหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={category === cat.id ? "default" : "outline"}
                      className="h-auto py-4 flex-col"
                      onClick={() => {
                        setCategory(cat.id);
                        setSelectedStyle("");
                      }}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs opacity-70">{cat.description}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Topic & Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">รายละเอียด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic */}
              <div className="space-y-2">
                <Label>หัวข้อ / สิ่งที่ต้องการในภาพ</Label>
                <Input
                  placeholder="เช่น iPhone 17 Pro Max, รถ Tesla Model 3, Apple Vision Pro"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Style Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>สไตล์ภาพ</Label>
                  <Button variant="ghost" size="sm" onClick={randomizeStyle}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    สุ่ม
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentStyles.map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedStyle === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      {style.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Style */}
              <div className="space-y-2">
                <Label>หรือกำหนด Style เอง</Label>
                <Textarea
                  placeholder="เช่น cyberpunk style, neon colors, dark atmosphere..."
                  value={customStyle}
                  onChange={(e) => {
                    setCustomStyle(e.target.value);
                    if (e.target.value) setSelectedStyle("");
                  }}
                  rows={2}
                />
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label>สิ่งที่ไม่ต้องการ (Negative Prompt)</Label>
                <Input
                  placeholder="เช่น text, watermark, blurry, low quality"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <Button onClick={generatePrompt} className="w-full" size="lg" disabled={!topic}>
                <Sparkles className="h-4 w-4 mr-2" />
                สร้าง Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Generated Prompt */}
          {generatedPrompt && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Prompt ที่สร้าง
                  </CardTitle>
                  <Badge className={aiTools.find(t => t.id === selectedTool)?.color}>
                    {aiTools.find(t => t.id === selectedTool)?.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {generatedPrompt}
                </div>
                <Button onClick={copyPrompt} className="w-full">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Tips */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {currentTemplate?.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-1">📐 Aspect Ratios</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Feature Image: 16:9 (1920x1080)</li>
                  <li>• YouTube Thumb: 16:9 (1280x720)</li>
                  <li>• Instagram: 1:1 (1080x1080)</li>
                  <li>• Story/Reels: 9:16 (1080x1920)</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">🎨 iMoD Brand Colors</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-[#ED2887]" title="#ED2887" />
                  <div className="w-8 h-8 rounded bg-[#612BAE]" title="#612BAE" />
                  <div className="w-8 h-8 rounded bg-gradient-to-r from-[#ED2887] to-[#612BAE]" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Primary: #ED2887 → #612BAE
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">⚡ Midjourney Params</p>
                <ul className="text-muted-foreground space-y-1 font-mono text-xs">
                  <li>--ar 16:9 (aspect ratio)</li>
                  <li>--v 6 (version 6)</li>
                  <li>--style raw (realistic)</li>
                  <li>--no text (negative)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* External Link */}
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-3">
                ใช้ Prompt Generator เวอร์ชันเต็มได้ที่:
              </p>
              <Button variant="outline" asChild className="w-full">
                <a 
                  href="https://www.iphonemod.net/tools/promptgen/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  iphonemod.net/tools/promptgen
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
