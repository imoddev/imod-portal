import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = "/tmp/imod-portal/long-to-short";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const fileName = searchParams.get("file");

    if (!jobId || !fileName) {
      return NextResponse.json({ error: "Missing jobId or file" }, { status: 400 });
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFileName = path.basename(fileName);
    const filePath = path.join(UPLOAD_DIR, jobId, "clips", sanitizedFileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    let contentType = "application/octet-stream";
    if (sanitizedFileName.endsWith(".mp4")) {
      contentType = "video/mp4";
    } else if (sanitizedFileName.endsWith(".jpg") || sanitizedFileName.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (sanitizedFileName.endsWith(".png")) {
      contentType = "image/png";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${sanitizedFileName}"`,
      },
    });

  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File serve failed" },
      { status: 500 }
    );
  }
}
