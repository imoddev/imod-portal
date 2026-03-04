import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/analytics/sources - News source analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month"; // week, month, year
  const team = searchParams.get("team"); // it, ev

  try {
    // Calculate date range
    const now = new Date();
    let afterDate: Date;
    if (period === "week") {
      afterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "year") {
      afterDate = new Date(now.getFullYear(), 0, 1);
    } else {
      afterDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const where: any = {
      createdAt: { gte: afterDate },
    };
    if (team) where.team = team;

    // Get all news items
    const newsItems = await prisma.newsItem.findMany({
      where,
      select: {
        source: true,
        category: true,
        status: true,
        team: true,
      },
    });

    // Analyze by source
    const bySource: Record<string, { total: number; claimed: number; published: number }> = {};
    const byCategory: Record<string, number> = {};

    for (const item of newsItems) {
      // By source
      if (!bySource[item.source]) {
        bySource[item.source] = { total: 0, claimed: 0, published: 0 };
      }
      bySource[item.source].total++;
      if (item.status === "claimed" || item.status === "drafting") {
        bySource[item.source].claimed++;
      }
      if (item.status === "published") {
        bySource[item.source].published++;
      }

      // By category
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }

    // Calculate conversion rates
    const sourceRankings = Object.entries(bySource)
      .map(([source, stats]) => ({
        source,
        ...stats,
        conversionRate: stats.total > 0 ? ((stats.claimed + stats.published) / stats.total * 100) : 0,
        publishRate: stats.total > 0 ? (stats.published / stats.total * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Top sources by different metrics
    const topByVolume = [...sourceRankings].slice(0, 10);
    const topByConversion = [...sourceRankings].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 10);
    const topByPublished = [...sourceRankings].sort((a, b) => b.published - a.published).slice(0, 10);

    // Recommendations
    const recommendations: string[] = [];
    
    // Low volume high conversion sources
    const hiddenGems = sourceRankings.filter(s => s.total >= 5 && s.conversionRate >= 50);
    if (hiddenGems.length > 0) {
      recommendations.push(`แหล่งข่าวที่ควรติดตามเพิ่ม: ${hiddenGems.slice(0, 3).map(s => s.source).join(", ")}`);
    }

    // High volume low conversion sources
    const underperforming = sourceRankings.filter(s => s.total >= 10 && s.conversionRate < 10);
    if (underperforming.length > 0) {
      recommendations.push(`แหล่งที่อาจลดความสำคัญได้: ${underperforming.slice(0, 3).map(s => s.source).join(", ")}`);
    }

    return NextResponse.json({
      success: true,
      period,
      totalNews: newsItems.length,
      totalSources: Object.keys(bySource).length,
      topByVolume,
      topByConversion,
      topByPublished,
      byCategory: Object.entries(byCategory)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      recommendations,
    });
  } catch (error) {
    console.error("Source analytics error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
