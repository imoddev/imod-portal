"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Copy,
  Loader2,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  type: string;
  category: string | null;
  content: string;
  authorName: string | null;
  usageCount: number;
}

const templateTypes = [
  { id: "intro", name: "บทนำ (Intro)", icon: "📖" },
  { id: "conclusion", name: "บทสรุป (Conclusion)", icon: "📝" },
  { id: "style", name: "รูปแบบการเขียน", icon: "✍️" },
  { id: "snippet", name: "Code Snippet", icon: "💻" },
  { id: "prompt", name: "AI Prompt", icon: "🤖" },
];

const categories = ["Apple", "Samsung", "EV", "AI", "Tech", "Review", "News", "General"];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    category: "",
    content: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, [filterType, filterCategory]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      let url = "/api/templates?";
      if (filterType !== "all") url += `type=${filterType}&`;
      if (filterCategory !== "all") url += `category=${filterCategory}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.content) {
      alert("กรุณากรอกชื่อ, ประเภท และเนื้อหา");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          authorName: "Admin", // TODO: Get from session
        }),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setForm({ name: "", type: "", category: "", content: "" });
        fetchTemplates();
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (template: Template) => {
    await navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter templates
  const filteredTemplates = templates;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Template Library
          </h1>
          <p className="text-muted-foreground">
            เทมเพลตสำหรับเขียนบทความ ({templates.length} รายการ)
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่ม Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เพิ่ม Template ใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อ Template *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น บทนำสไตล์ข่าว Apple"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ประเภท *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่ (ถ้ามี)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>เนื้อหา Template *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="เนื้อหา template... ใช้ {{variable}} สำหรับตัวแปร"
                  rows={10}
                />
                <p className="text-xs text-muted-foreground">
                  💡 ใช้ {"{{title}}, {{source}}, {{keyphrase}}"} เป็นตัวแปร
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภท</SelectItem>
            {templateTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.icon} {t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกหมวด</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>ยังไม่มี Template</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              สร้าง Template แรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const typeConfig = templateTypes.find(t => t.id === template.type);
            return (
              <Card key={template.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{typeConfig?.icon} {typeConfig?.name}</Badge>
                        {template.category && (
                          <Badge variant="secondary">{template.category}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-hidden max-h-32 whitespace-pre-wrap">
                    {template.content.substring(0, 200)}...
                  </pre>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      ใช้แล้ว {template.usageCount} ครั้ง
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(template)}
                    >
                      {copiedId === template.id ? (
                        <>✓ คัดลอกแล้ว</>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          คัดลอก
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
