import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/news - Get all news items from database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const team = searchParams.get("team");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (status) where.status = status;
    if (team) where.team = team;

    const news = await prisma.newsItem.findMany({
      where,
      orderBy: [
        { date: "desc" },
        { time: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({ 
      success: true, 
      data: news,
      count: news.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
