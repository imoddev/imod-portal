import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createShortUrl, getOrCreateShortUrl } from "@/lib/short-url";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, slug, title, findExisting = true } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    let result;
    if (findExisting && !slug) {
      // Try to find existing or create new
      result = await getOrCreateShortUrl(url);
    } else {
      // Create new with optional custom slug
      result = await createShortUrl({ originalUrl: url, slug, title });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create short URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ shortUrl: result.shortUrl });
  } catch (error) {
    console.error("Error creating short URL:", error);
    return NextResponse.json(
      { error: "Failed to create short URL" },
      { status: 500 }
    );
  }
}
