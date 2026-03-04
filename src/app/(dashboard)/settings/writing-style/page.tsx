"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  Upload,
  FileText,
  Check,
  AlertCircle,
  ArrowLeft,
  Brain,
  Loader2,
  Link,
  Copy,
} from "lucide-react";

interface WritingStyle {
  id: string;
  name: string;
  description: string;
  samples: string[];
  rules: string[];
  status: "training" | "ready" | "draft";
  createdAt: string;
}

// Mock existing styles
const mockStyles: WritingStyle[] = [
  {
    id: "thitirath",
    name: "สไตล์พี่เต็นท์",
    description: "ตามกฎ 14 ข้อ, ใช้ มี.ค. แทน เดือนมีนาคม, H2 ไม่เกิน 1 อัน",
    samples: [
      "https://www.iphonemod.net/iphone-16e-launch.html",
      "https://www.iphonemod.net/ios-18-features.html",
    ],
    rules: [
      "ใช้ มี.ค. แทน เดือนมีนาคม",
      "H2 ไม่เกิน 1 อัน",
      "ลด Bold ให้น้อยที่สุด",
      "มี <!--more--> หลัง paragraph แรก",
    ],
    status: "ready",
    createdAt: "2026-02-15",
  },
  {
    id: "sakura",
    name: "สไตล์พี่ซา",
    description: "เน้น EV, รายละเอียดสเปคครบ, ราคาชัดเจน",
    samples: [
      "https://ev.iphonemod.net/byd-sealion-7-review.html",
    ],
    rules: [
      "ระบุราคาทุกรุ่นย่อย",
      "ตารางสเปคครบถ้วน",
      "เปรียบเทียบกับคู่แข่ง",
    ],
    status: "ready",
    createdAt: "2026-02-20",
  },
];

export default function WritingStylePage() {
  const [styles, setStyles] = useState<WritingStyle[]>(mockStyles);
  const [isCreating, setIsCreating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [newStyle, setNewStyle] = useState({
    name: "",
    description: "",
    sampleUrls: [""],
    rules: [""],
  });

  const addSampleUrl = () => {
    setNewStyle({ ...newStyle, sampleUrls: [...newStyle.sampleUrls, ""] });
  };

  const removeSampleUrl = (index: number) => {
    setNewStyle({
      ...newStyle,
      sampleUrls: newStyle.sampleUrls.filter((_, i) => i !== index),
    });
  };

  const updateSampleUrl = (index: number, value: string) => {
    const urls = [...newStyle.sampleUrls];
    urls[index] = value;
    setNewStyle({ ...newStyle, sampleUrls: urls });
  };

  const addRule = () => {
    setNewStyle({ ...newStyle, rules: [...newStyle.rules, ""] });
  };

  const removeRule = (index: number) => {
    setNewStyle({
      ...newStyle,
      rules: newStyle.rules.filter((_, i) => i !== index),
    });
  };

  const updateRule = (index: number, value: string) => {
    const rules = [...newStyle.rules];
    rules[index] = value;
    setNewStyle({ ...newStyle, rules: rules });
  };

  const startTraining = async () => {
    if (!newStyle.name || newStyle.sampleUrls.filter(Boolean).length === 0) return;
    
    setIsTraining(true);
    
    // Simulate training
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const style: WritingStyle = {
      id: Date.now().toString(),
      name: newStyle.name,
      description: newStyle.description,
      samples: newStyle.sampleUrls.filter(Boolean),
      rules: newStyle.rules.filter(Boolean),
      status: "ready",
      createdAt: new Date().toISOString().split("T")[0],
    };
    
    setStyles([...styles, style]);
    setIsTraining(false);
    setIsCreating(false);
    setNewStyle({ name: "", description: "", sampleUrls: [""], rules: [""] });
  };

  const deleteStyle = (id: string) => {
    setStyles(styles.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/draft">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Writing Style Training
            </h1>
            <p className="text-muted-foreground">
              Train AI ให้เขียนตามสไตล์ของคุณ
            </p>
          </div>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            สร้างสไตล์ใหม่
          </Button>
        )}
      </div>

      {/* Create New Style */}
      {isCreating && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Train สไตล์ใหม่
            </CardTitle>
            <CardDescription>
              ใส่บทความตัวอย่างที่คุณเขียน AI จะเรียนรู้สไตล์การเขียนของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>ชื่อสไตล์ *</Label>
                <Input
                  placeholder="เช่น สไตล์ของฉัน"
                  value={newStyle.name}
                  onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>คำอธิบาย</Label>
                <Input
                  placeholder="เช่น เน้นเล่าแบบเป็นกันเอง"
                  value={newStyle.description}
                  onChange={(e) => setNewStyle({ ...newStyle, description: e.target.value })}
                />
              </div>
            </div>

            {/* Sample URLs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>บทความตัวอย่าง (URLs) *</Label>
                <Button variant="ghost" size="sm" onClick={addSampleUrl}>
                  <Plus className="h-3 w-3 mr-1" />
                  เพิ่ม URL
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ใส่ลิงก์บทความที่คุณเขียน อย่างน้อย 3-5 บทความ จะช่วยให้ AI เรียนรู้สไตล์ได้ดีขึ้น
              </p>
              <div className="space-y-2">
                {newStyle.sampleUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://www.iphonemod.net/your-article.html"
                        value={url}
                        onChange={(e) => updateSampleUrl(index, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {newStyle.sampleUrls.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSampleUrl(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>กฎการเขียนเพิ่มเติม (ถ้ามี)</Label>
                <Button variant="ghost" size="sm" onClick={addRule}>
                  <Plus className="h-3 w-3 mr-1" />
                  เพิ่มกฎ
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ระบุกฎหรือข้อกำหนดพิเศษในการเขียน เช่น &quot;ใช้ภาษาทางการ&quot; หรือ &quot;ไม่ใช้ emoji&quot;
              </p>
              <div className="space-y-2">
                {newStyle.rules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="เช่น ใช้ภาษาเป็นกันเอง"
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                    />
                    {newStyle.rules.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewStyle({ name: "", description: "", sampleUrls: [""], rules: [""] });
                }}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={startTraining}
                disabled={!newStyle.name || newStyle.sampleUrls.filter(Boolean).length === 0 || isTraining}
              >
                {isTraining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    กำลัง Train...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    เริ่ม Training
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Styles */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">สไตล์ที่มีอยู่</h2>
        
        {styles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีสไตล์ที่ train ไว้</p>
              <Button className="mt-4" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                สร้างสไตล์แรก
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {styles.map((style) => (
              <Card key={style.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {style.name}
                        <Badge
                          variant={style.status === "ready" ? "default" : "secondary"}
                        >
                          {style.status === "ready" ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              พร้อมใช้
                            </>
                          ) : style.status === "training" ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              กำลัง Train
                            </>
                          ) : (
                            "Draft"
                          )}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{style.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => deleteStyle(style.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Samples */}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      ตัวอย่างที่ใช้ Train ({style.samples.length} บทความ)
                    </Label>
                    <div className="mt-1 space-y-1">
                      {style.samples.slice(0, 2).map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {url}
                        </a>
                      ))}
                      {style.samples.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{style.samples.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rules */}
                  {style.rules.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">กฎการเขียน</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {style.rules.map((rule, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {rule}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Created Date */}
                  <p className="text-xs text-muted-foreground">
                    สร้างเมื่อ: {style.createdAt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">วิธีการ Train ที่ดี</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>ใส่บทความตัวอย่างอย่างน้อย 3-5 บทความ</li>
                <li>เลือกบทความที่มีสไตล์การเขียนคล้ายกัน</li>
                <li>ระบุกฎการเขียนพิเศษที่คุณใช้เป็นประจำ</li>
                <li>ยิ่งมีตัวอย่างมาก AI จะเรียนรู้สไตล์ได้แม่นยำขึ้น</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
