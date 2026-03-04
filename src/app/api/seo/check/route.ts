import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSEO } from "@/lib/seo-checker";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, focusKeyphrase, metaDescription } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const result = analyzeSEO({
      title,
      slug: slug || "",
      content,
      excerpt,
      focusKeyphrase,
      metaDescription,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing SEO:", error);
    return NextResponse.json(
      { error: "Failed to analyze SEO" },
      { status: 500 }
    );
  }
}
