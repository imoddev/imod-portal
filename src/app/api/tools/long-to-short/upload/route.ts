import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = "/tmp/imod-portal/long-to-short";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const clipCount = formData.get("clipCount") as string;
    const maxDuration = formData.get("maxDuration") as string;

    if (!video) {
      return NextResponse.json({ error: "No video file" }, { status: 400 });
    }

    // Create job directory
    const jobId = uuidv4();
    const jobDir = path.join(UPLOAD_DIR, jobId);
    
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    await mkdir(jobDir, { recursive: true });

    // Save video file
    const videoBuffer = Buffer.from(await video.arrayBuffer());
    const videoPath = path.join(jobDir, video.name);
    await writeFile(videoPath, videoBuffer);

    // Extract audio for transcription
    const audioPath = path.join(jobDir, "audio.wav");
    
    // Run ffmpeg to extract audio
    const { execSync } = require("child_process");
    execSync(
      `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`,
      { stdio: "pipe" }
    );

    // Save job config
    const configPath = path.join(jobDir, "config.json");
    await writeFile(configPath, JSON.stringify({
      jobId,
      videoPath,
      audioPath,
      clipCount: parseInt(clipCount) || 3,
      maxDuration: parseInt(maxDuration) || 60,
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      jobId,
      audioPath,
      videoPath,
      message: "Upload successful",
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
