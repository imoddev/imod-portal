"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Trash2,
  RefreshCw,
  HardDrive,
  FolderOpen,
  Server,
} from "lucide-react";
import Link from "next/link";

const API_URL = "https://shorts-api.iphonemod.net";

interface QueueFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  status: string;
  progress: number;
}

interface Clip {
  id: number;
  start: number;
  end: number;
  duration: number;
  title: string;
  reason: string;
  filename: string;
}

interface JobStatus {
  id: string;
  status: string;
  progress: number;
  clips?: Clip[];
  transcript?: string;
  error?: string;
  currentTool?: string;
  timing?: {
    extractAudio?: number;
    transcribe?: number;
    analyze?: number;
    cutting?: number;
    total?: number;
  };
}

export default function LongToShortPage() {
  const [files, setFiles] = useState<QueueFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<QueueFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [clipCount, setClipCount] = useState(3);
  const [maxDuration, setMaxDuration] = useState(60);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  // Check API status
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/health`, { mode: "cors" });
      if (res.ok) {
        setApiStatus("online");
        fetchFiles();
      } else {
        setApiStatus("offline");
      }
    } catch {
      setApiStatus("offline");
    }
  };

  // Fetch files in queue
  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/files`, { mode: "cors" });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // Upload file
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("video", file);

    try {
      // Simulate progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        const data = await res.json();
        fetchFiles();
        setSelectedFile({
          id: data.jobId,
          filename: data.filename,
          originalName: data.originalName,
          size: data.size,
          sizeFormatted: data.sizeFormatted,
          createdAt: new Date().toISOString(),
          status: "ready",
          progress: 0,
        });
      } else {
        const error = await res.json();
        console.error("Upload error:", error);
        alert(`อัปโหลดไม่สำเร็จ: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("ไม่สามารถเชื่อมต่อ API ได้");
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  // Delete file
  const handleDelete = async (jobId: string) => {
    if (!confirm("ต้องการลบไฟล์นี้?")) return;

    try {
      const res = await fetch(`${API_URL}/files/${jobId}`, { method: "DELETE", mode: "cors" });
      if (res.ok) {
        fetchFiles();
        if (selectedFile?.id === jobId) {
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Process video
  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setJobStatus({ id: selectedFile.id, status: "starting", progress: 0 });

    try {
      const res = await fetch(`${API_URL}/process/${selectedFile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clipCount, maxDuration }),
        mode: "cors",
      });

      if (res.ok) {
        // Poll for status
        pollStatus(selectedFile.id);
      }
    } catch (error) {
      console.error("Process error:", error);
      setIsProcessing(false);
    }
  };

  // Poll job status
  const pollStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/status/${jobId}`, { mode: "cors" });
        if (res.ok) {
          const status = await res.json();
          setJobStatus(status);

          if (status.status === "done" || status.status === "error") {
            setIsProcessing(false);
            fetchFiles();
          } else {
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error("Poll error:", error);
        setIsProcessing(false);
      }
    };
    poll();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} วินาที`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins} นาที`;
    return `${mins} นาที ${secs} วินาที`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "extracting_audio": return "กำลังแยกเสียง...";
      case "transcribing": return "กำลังถอดเสียง (whisper.cpp)...";
      case "analyzing": return "AI กำลังวิเคราะห์...";
      case "cutting": return "กำลังตัดคลิป...";
      case "done": return "เสร็จสิ้น!";
      case "error": return "เกิดข้อผิดพลาด";
      default: return status;
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scissors className="h-6 w-6" />
            Long to Short
          </h1>
          <p className="text-muted-foreground">
            ตัดคลิปยาวเป็น Shorts/Reels อัตโนมัติด้วย AI
          </p>
        </div>
        
        {/* API Status */}
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          {apiStatus === "checking" ? (
            <Badge variant="outline"><Loader2 className="h-3 w-3 animate-spin mr-1" />Checking...</Badge>
          ) : apiStatus === "online" ? (
            <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Mac Studio Online</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700"><AlertCircle className="h-3 w-3 mr-1" />Offline</Badge>
          )}
        </div>
      </div>

      {apiStatus === "offline" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Mac Studio API Offline</p>
                <p className="text-sm">กรุณาตรวจสอบว่า long-to-short-api กำลังรันอยู่</p>
              </div>
              <Button variant="outline" size="sm" onClick={checkApiStatus} className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-1" />
                ลองใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {apiStatus === "online" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* File Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  คิวไฟล์รอตัด
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchFiles}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                ไฟล์ที่อัปโหลดไว้ใน Mac Studio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Upload Button */}
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploading}
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="space-y-2">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                      <p className="text-sm">กำลังอัปโหลด... {uploadProgress}%</p>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        อัปโหลดไฟล์ (สูงสุด 10GB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* File List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {files.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ยังไม่มีไฟล์ในคิว
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFile?.id === file.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Video className="h-8 w-8 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {file.originalName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HardDrive className="h-3 w-3" />
                            {file.sizeFormatted}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {file.status !== "ready" && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {file.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">ประมวลผล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedFile ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileVideo className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>เลือกไฟล์จากคิวเพื่อเริ่มตัด</p>
                </div>
              ) : (
                <>
                  {/* Selected File Info */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Video className="h-10 w-10 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.sizeFormatted}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        จำนวนคลิป: {clipCount}
                      </label>
                      <Slider
                        value={[clipCount]}
                        onValueChange={(v) => setClipCount(v[0])}
                        min={1}
                        max={10}
                        step={1}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        ความยาวสูงสุด: {maxDuration}s
                      </label>
                      <Slider
                        value={[maxDuration]}
                        onValueChange={(v) => setMaxDuration(v[0])}
                        min={15}
                        max={180}
                        step={15}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  {/* Process Button */}
                  <Button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {isProcessing ? "กำลังประมวลผล..." : "เริ่มตัดคลิป"}
                  </Button>

                  {/* Progress */}
                  {jobStatus && (
                    <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                      {/* Status Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {jobStatus.status === "done" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : jobStatus.status === "error" ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          )}
                          <span className="font-medium">
                            {getStatusText(jobStatus.status)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold">
                          {jobStatus.progress}%
                        </Badge>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <Progress value={jobStatus.progress} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>เริ่มต้น</span>
                          <span>เสร็จสิ้น</span>
                        </div>
                      </div>
                      
                      {/* Steps Indicator */}
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {[
                          { key: "extracting_audio", label: "แยกเสียง", tool: "FFmpeg", pct: 10, timeKey: "extractAudio" as const },
                          { key: "transcribing", label: "ถอดเสียง", tool: "whisper.cpp", pct: 30, timeKey: "transcribe" as const },
                          { key: "analyzing", label: "AI วิเคราะห์", tool: "Qwen 3 8B", pct: 60, timeKey: "analyze" as const },
                          { key: "cutting", label: "ตัด + Reframe", tool: "YOLO + FFmpeg", pct: 80, timeKey: "cutting" as const },
                        ].map((step) => {
                          const isActive = jobStatus.status === step.key;
                          const isDone = jobStatus.progress > step.pct;
                          const stepTime = jobStatus.timing?.[step.timeKey];
                          return (
                            <div
                              key={step.key}
                              className={`text-center p-2 rounded-lg transition-all ${
                                isActive
                                  ? "bg-primary/20 text-primary font-medium ring-2 ring-primary"
                                  : isDone
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <div className="text-xs font-medium">
                                {isDone && !isActive ? "✓ " : ""}
                                {step.label}
                              </div>
                              <div className="text-[10px] opacity-70 mt-0.5">
                                {step.tool}
                              </div>
                              {stepTime !== undefined && (
                                <div className="text-[10px] mt-0.5 font-mono">
                                  {stepTime}s
                                </div>
                              )}
                              {isActive && (
                                <div className="text-[10px] mt-0.5 animate-pulse">
                                  กำลังทำ...
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Total Time */}
                      {jobStatus.timing?.total !== undefined && (
                        <div className="flex items-center justify-center gap-2 pt-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>เวลารวม: <strong>{formatDuration(jobStatus.timing.total)}</strong></span>
                        </div>
                      )}
                      
                      {jobStatus.error && (
                        <p className="text-sm text-red-600 mt-2">{jobStatus.error}</p>
                      )}
                    </div>
                  )}

                  {/* Results */}
                  {jobStatus?.clips && jobStatus.clips.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium">ผลลัพธ์ ({jobStatus.clips.length} คลิป)</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {jobStatus.clips.map((clip) => (
                          <Card key={clip.id} className="overflow-hidden">
                            <div className="aspect-[9/16] bg-muted flex items-center justify-center">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">Clip {clip.id}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(clip.duration)}
                                </span>
                              </div>
                              <p className="text-xs line-clamp-2">{clip.title}</p>
                              <Button size="sm" className="w-full" asChild>
                                <a
                                  href={`${API_URL}/download/${selectedFile.id}/${clip.filename}`}
                                  download
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </a>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📁 ที่เก็บไฟล์</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p><strong>Temp:</strong> /Users/imodteam/Videos/LongToShort/temp/</p>
          <p><strong>Output:</strong> /Users/imodteam/Videos/LongToShort/output/</p>
          <p><strong>API:</strong> shorts-api.iphonemod.net (Mac Studio)</p>
        </CardContent>
      </Card>
    </div>
  );
}
