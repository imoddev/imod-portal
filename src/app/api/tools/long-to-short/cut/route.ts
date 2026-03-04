import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = "/tmp/imod-portal/long-to-short";

export async function POST(request: NextRequest) {
  try {
    const { jobId, highlights } = await request.json();

    if (!jobId || !highlights) {
      return NextResponse.json({ error: "Missing jobId or highlights" }, { status: 400 });
    }

    const jobDir = path.join(UPLOAD_DIR, jobId);
    const outputDir = path.join(jobDir, "clips");
    
    // Read config to get video path
    const configData = await readFile(path.join(jobDir, "config.json"), "utf-8");
    const config = JSON.parse(configData);
    const videoPath = config.videoPath;

    // Create output directory
    if (!existsSync(outputDir)) {
      execSync(`mkdir -p "${outputDir}"`);
    }

    const clips: any[] = [];

    for (const highlight of highlights) {
      const clipPath = path.join(outputDir, `clip_${highlight.id}_vertical.mp4`);
      const thumbnailPath = path.join(outputDir, `clip_${highlight.id}_thumb.jpg`);
      
      const duration = highlight.end - highlight.start;

      // Get video dimensions first
      const probeResult = execSync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`,
        { encoding: "utf-8" }
      ).trim();
      const [width, height] = probeResult.split(",").map(Number);

      // Determine crop for 9:16
      let cropFilter = "";
      if (width > height) {
        // Landscape -> Portrait (center crop)
        const newWidth = Math.round(height * 9 / 16);
        const x = Math.round((width - newWidth) / 2);
        cropFilter = `crop=${newWidth}:${height}:${x}:0,scale=1080:1920`;
      } else {
        // Already portrait or square
        cropFilter = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2`;
      }

      // Cut and crop clip
      try {
        execSync(
          `ffmpeg -ss ${highlight.start} -i "${videoPath}" -t ${duration} -vf "${cropFilter}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${clipPath}" -y`,
          { stdio: "pipe", timeout: 300000 }
        );

        // Generate thumbnail
        execSync(
          `ffmpeg -ss ${highlight.start + 1} -i "${videoPath}" -vframes 1 -vf "${cropFilter}" "${thumbnailPath}" -y`,
          { stdio: "pipe" }
        );

        clips.push({
          id: highlight.id,
          start: highlight.start,
          end: highlight.end,
          duration,
          title: highlight.title,
          reason: highlight.reason,
          path: clipPath,
          thumbnail: `/api/tools/long-to-short/file?jobId=${jobId}&file=clip_${highlight.id}_thumb.jpg`,
          downloadUrl: `/api/tools/long-to-short/file?jobId=${jobId}&file=clip_${highlight.id}_vertical.mp4`,
        });
      } catch (clipError) {
        console.error(`Error cutting clip ${highlight.id}:`, clipError);
        clips.push({
          id: highlight.id,
          start: highlight.start,
          end: highlight.end,
          duration,
          title: highlight.title,
          reason: highlight.reason,
          error: "Failed to cut clip",
        });
      }
    }

    // Save clips info
    await writeFile(
      path.join(jobDir, "clips.json"),
      JSON.stringify(clips, null, 2)
    );

    return NextResponse.json({
      clips,
      message: "Cutting complete",
    });

  } catch (error) {
    console.error("Cutting error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cutting failed" },
      { status: 500 }
    );
  }
}
