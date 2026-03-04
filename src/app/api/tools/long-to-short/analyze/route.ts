import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "/tmp/imod-portal/long-to-short";

export async function POST(request: NextRequest) {
  try {
    const { jobId, transcript, clipCount, maxDuration } = await request.json();

    if (!jobId || !transcript) {
      return NextResponse.json({ error: "Missing jobId or transcript" }, { status: 400 });
    }

    const jobDir = path.join(UPLOAD_DIR, jobId);
    
    // Read segments if available
    let segments: any[] = [];
    try {
      const segmentsData = await readFile(path.join(jobDir, "segments.json"), "utf-8");
      segments = JSON.parse(segmentsData);
    } catch {
      // Segments not available
    }

    // Use local Ollama with Qwen or Llama for analysis
    const highlights = await analyzeWithLLM(transcript, segments, clipCount, maxDuration);

    // Save highlights
    await writeFile(
      path.join(jobDir, "highlights.json"),
      JSON.stringify(highlights, null, 2)
    );

    return NextResponse.json({
      highlights,
      message: "Analysis complete",
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

interface Highlight {
  id: number;
  start: number;
  end: number;
  title: string;
  reason: string;
}

async function analyzeWithLLM(
  transcript: string,
  segments: any[],
  clipCount: number,
  maxDuration: number
): Promise<Highlight[]> {
  const prompt = `คุณเป็น AI ที่ช่วยหา highlight จากวิดีโอสำหรับทำ Short-form content

Transcript:
${transcript}

${segments.length > 0 ? `
Segments with timestamps:
${segments.map(s => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`).join('\n')}
` : ''}

กรุณาหา ${clipCount} ช่วงที่น่าสนใจที่สุดสำหรับทำ Short/Reels
แต่ละคลิปไม่เกิน ${maxDuration} วินาที

เลือกจาก:
1. Hook ที่ดึงความสนใจ (ประโยคแรกที่น่าสนใจ)
2. ข้อมูลสำคัญ / Insight ใหม่
3. มุกตลก / ช่วงที่มี emotion
4. สรุปหรือ call-to-action

ตอบเป็น JSON array ดังนี้:
[
  {
    "id": 1,
    "start": <start_seconds>,
    "end": <end_seconds>,
    "title": "<short title for this clip>",
    "reason": "<why this segment is good for short-form>"
  }
]

ตอบเฉพาะ JSON เท่านั้น ไม่ต้องอธิบายเพิ่ม`;

  try {
    // Try Ollama first (local)
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b", // or llama3.2
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
        },
      }),
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      const response = data.response;
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (ollamaError) {
    console.log("Ollama not available, using fallback...");
  }

  // Fallback: Simple highlight detection based on transcript length
  // This is a basic fallback when LLM is not available
  const totalDuration = segments.length > 0 
    ? segments[segments.length - 1].end 
    : 300; // assume 5 min if no segments

  const highlights: Highlight[] = [];
  const interval = totalDuration / (clipCount + 1);

  for (let i = 0; i < clipCount; i++) {
    const start = Math.round(interval * (i + 0.5));
    const end = Math.min(start + maxDuration, totalDuration);
    
    highlights.push({
      id: i + 1,
      start,
      end: Math.min(end, start + maxDuration),
      title: `Highlight ${i + 1}`,
      reason: "Auto-detected segment (LLM unavailable)",
    });
  }

  return highlights;
}
