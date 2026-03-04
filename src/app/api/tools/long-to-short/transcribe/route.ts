import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "/tmp/imod-portal/long-to-short";
const WHISPER_MODEL = "base"; // Options: tiny, base, small, medium, large

export async function POST(request: NextRequest) {
  try {
    const { jobId, audioPath } = await request.json();

    if (!jobId || !audioPath) {
      return NextResponse.json({ error: "Missing jobId or audioPath" }, { status: 400 });
    }

    const jobDir = path.join(UPLOAD_DIR, jobId);
    const transcriptPath = path.join(jobDir, "transcript.txt");
    const srtPath = path.join(jobDir, "transcript.srt");

    // Run whisper.cpp transcription
    // Using whisper-cli with Thai language
    try {
      execSync(
        `whisper-cli -l th -m ${WHISPER_MODEL} -t 8 -osrt -otxt -of "${path.join(jobDir, 'transcript')}" "${audioPath}"`,
        { stdio: "pipe", timeout: 600000 } // 10 min timeout
      );
    } catch (whisperError) {
      // Fallback: Try with whisper (Python) if whisper-cli not available
      console.log("whisper-cli failed, trying whisper...");
      execSync(
        `whisper "${audioPath}" --language th --model ${WHISPER_MODEL} --output_dir "${jobDir}" --output_format txt,srt`,
        { stdio: "pipe", timeout: 600000 }
      );
    }

    // Read transcript
    let transcript = "";
    try {
      transcript = await readFile(transcriptPath, "utf-8");
    } catch {
      // Try to read from audio.txt if filename differs
      const audioTranscript = path.join(jobDir, "audio.txt");
      transcript = await readFile(audioTranscript, "utf-8");
    }

    // Read SRT for timestamps
    let srt = "";
    try {
      srt = await readFile(srtPath, "utf-8");
    } catch {
      const audioSrt = path.join(jobDir, "audio.srt");
      try {
        srt = await readFile(audioSrt, "utf-8");
      } catch {
        // SRT optional
      }
    }

    // Parse SRT to get segments with timestamps
    const segments = parseSRT(srt);

    // Save parsed data
    await writeFile(
      path.join(jobDir, "segments.json"),
      JSON.stringify(segments, null, 2)
    );

    return NextResponse.json({
      transcript,
      segments,
      srt,
      message: "Transcription complete",
    });

  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

function parseSRT(srt: string): Segment[] {
  if (!srt) return [];
  
  const segments: Segment[] = [];
  const blocks = srt.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length >= 3) {
      const id = parseInt(lines[0]);
      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      
      if (timeMatch) {
        const start = parseTimeToSeconds(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
        const end = parseTimeToSeconds(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
        const text = lines.slice(2).join(" ").trim();
        
        segments.push({ id, start, end, text });
      }
    }
  }

  return segments;
}

function parseTimeToSeconds(h: string, m: string, s: string, ms: string): number {
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
}
