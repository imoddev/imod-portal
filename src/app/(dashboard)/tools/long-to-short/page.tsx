"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Scissors,
  Upload,
  Video,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Clock,
  FileVideo,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Clip {
  id: number;
  start: number;
  end: number;
  duration: number;
  title: string;
  reason: string;
  thumbnail?: string;
}

interface ProcessingStatus {
  stage: "idle" | "uploading" | "transcribing" | "analyzing" | "cutting" | "done" | "error";
  progress: number;
  message: string;
}

export default function LongToShortPage() {
  const [file, setFile] = useState<File | null>(null);
  const [clipCount, setClipCount] = useState(3);
  const [maxDuration, setMaxDuration] = useState(60);
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const [clips, setClips] = useState<Clip[]>([]);
  const [transcript, setTranscript] = useState("");
  const [videoInfo, setVideoInfo] = useState<{
    duration: number;
    resolution: string;
    filename: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setClips([]);
      setStatus({ stage: "idle", progress: 0, message: "" });
      
      // Get video info
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoInfo({
          duration: Math.round(video.duration),
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          filename: selectedFile.name,
        });
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const processVideo = async () => {
    if (!file) return;

    try {
      // Stage 1: Upload
      setStatus({ stage: "uploading", progress: 10, message: "กำลังอัปโหลดวิดีโอ..." });
      
      const formData = new FormData();
      formData.append("video", file);
      formData.append("clipCount", clipCount.toString());
      formData.append("maxDuration", maxDuration.toString());

      const uploadRes = await fetch("/api/tools/long-to-short/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { jobId, audioPath } = await uploadRes.json();

      // Stage 2: Transcribe
      setStatus({ stage: "transcribing", progress: 30, message: "กำลังถอดเสียง (whisper.cpp)..." });
      
      const transcribeRes = await fetch("/api/tools/long-to-short/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, audioPath }),
      });

      if (!transcribeRes.ok) throw new Error("Transcription failed");
      const { transcript: transcriptText } = await transcribeRes.json();
      setTranscript(transcriptText);

      // Stage 3: AI Analysis
      setStatus({ stage: "analyzing", progress: 60, message: "AI กำลังหา highlights..." });

      const analyzeRes = await fetch("/api/tools/long-to-short/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          jobId, 
          transcript: transcriptText,
          clipCount,
          maxDuration 
        }),
      });

      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const { highlights } = await analyzeRes.json();

      // Stage 4: Cut clips
      setStatus({ stage: "cutting", progress: 80, message: "กำลังตัดคลิป..." });

      const cutRes = await fetch("/api/tools/long-to-short/cut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, highlights }),
      });

      if (!cutRes.ok) throw new Error("Cutting failed");
      const { clips: resultClips } = await cutRes.json();

      setClips(resultClips);
      setStatus({ stage: "done", progress: 100, message: "เสร็จสิ้น!" });

    } catch (error) {
      console.error("Processing error:", error);
      setStatus({ 
        stage: "error", 
        progress: 0, 
        message: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}` 
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStageIcon = () => {
    switch (status.stage) {
      case "uploading": return <Upload className="h-5 w-5 animate-pulse" />;
      case "transcribing": return <FileVideo className="h-5 w-5 animate-pulse" />;
      case "analyzing": return <Sparkles className="h-5 w-5 animate-pulse" />;
      case "cutting": return <Scissors className="h-5 w-5 animate-pulse" />;
      case "done": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error": return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
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
            <Scissors className="h-6 w-6" />
            Long to Short
          </h1>
          <p className="text-muted-foreground">
            ตัดคลิปยาวเป็น Shorts/Reels อัตโนมัติด้วย AI
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload & Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">อัปโหลดวิดีโอ</CardTitle>
            <CardDescription>
              รองรับ MP4, MOV, MKV (สูงสุด 2GB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>ไฟล์วิดีโอ</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <Video className="h-10 w-10 mx-auto text-primary" />
                      <p className="font-medium">{file.name}</p>
                      {videoInfo && (
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(videoInfo.duration)}
                          </span>
                          <span>{videoInfo.resolution}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>จำนวนคลิป: {clipCount}</Label>
                <Slider
                  value={[clipCount]}
                  onValueChange={(v) => setClipCount(v[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              <div className="space-y-3">
                <Label>ความยาวสูงสุด: {maxDuration} วินาที</Label>
                <Slider
                  value={[maxDuration]}
                  onValueChange={(v) => setMaxDuration(v[0])}
                  min={15}
                  max={180}
                  step={15}
                />
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={processVideo}
              disabled={!file || status.stage !== "idle" && status.stage !== "done" && status.stage !== "error"}
              className="w-full"
              size="lg"
            >
              {status.stage !== "idle" && status.stage !== "done" && status.stage !== "error" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              เริ่มประมวลผล
            </Button>

            {/* Progress */}
            {status.stage !== "idle" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStageIcon()}
                  <span className="text-sm font-medium">{status.message}</span>
                </div>
                <Progress value={status.progress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">วิธีการทำงาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Transcribe</p>
                <p className="text-muted-foreground">
                  ถอดเสียงด้วย whisper.cpp (รองรับภาษาไทย)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">AI Analysis</p>
                <p className="text-muted-foreground">
                  วิเคราะห์หา highlights ด้วย Llama/Qwen
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Smart Crop</p>
                <p className="text-muted-foreground">
                  ตัด + Crop 9:16 แบบ face-aware
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="font-medium mb-2">⚡ Performance</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• วิดีโอ 7 นาที → ~2-3 นาที</li>
                <li>• 100% ประมวลผลใน Mac Studio</li>
                <li>• ไม่ส่งข้อมูลออก Cloud</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {clips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              ผลลัพธ์ — {clips.length} คลิป
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clips.map((clip) => (
                <Card key={clip.id} className="overflow-hidden">
                  <div className="aspect-[9/16] bg-muted flex items-center justify-center">
                    {clip.thumbnail ? (
                      <img 
                        src={clip.thumbnail} 
                        alt={clip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Video className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        Clip {clip.id}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(clip.duration)}
                      </span>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">
                      {clip.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {clip.reason}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
              {transcript}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
