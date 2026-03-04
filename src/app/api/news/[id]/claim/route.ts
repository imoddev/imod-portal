import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/news/[id]/claim - Claim a news item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Get user info from session or request body
    let claimedBy = session?.user?.name || session?.user?.email;
    
    // Allow override from body for dev
    try {
      const body = await request.json();
      if (body.claimedBy) claimedBy = body.claimedBy;
    } catch {
      // No body, use session
    }

    if (!claimedBy) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if news exists and is available
    const news = await prisma.newsItem.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: "News item not found" },
        { status: 404 }
      );
    }

    if (news.status !== "available") {
      return NextResponse.json(
        { success: false, error: `News already ${news.status} by ${news.claimedBy}` },
        { status: 400 }
      );
    }

    // Claim the news
    const updated = await prisma.newsItem.update({
      where: { id },
      data: {
        status: "claimed",
        claimedBy,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Claimed by ${claimedBy}`,
      data: updated,
    });
  } catch (error) {
    console.error("Error claiming news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
