import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, stat } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "images");

// GET /api/images - List uploaded images
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    // Ensure directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const files = await readdir(UPLOAD_DIR);
    const images: any[] = [];

    for (const file of files) {
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        const filePath = path.join(UPLOAD_DIR, file);
        const fileStat = await stat(filePath);

        images.push({
          name: file,
          url: `/uploads/images/${file}`,
          size: fileStat.size,
          createdAt: fileStat.birthtime,
        });
      }
    }

    // Sort by date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      images: images.slice(0, limit),
      total: images.length,
    });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/images - Upload image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tags = formData.get("tags") as string || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only images (JPG, PNG, GIF, WEBP) allowed" },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with tags
    const ext = path.extname(file.name) || ".jpg";
    const tagStr = tags ? `_${tags.replace(/\s+/g, "-").toLowerCase()}` : "";
    const filename = `${Date.now()}${tagStr}${ext}`;

    // Ensure directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/images/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
