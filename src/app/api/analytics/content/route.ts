import { NextRequest, NextResponse } from "next/server";

const WP_SITES = {
  imod: "https://www.iphonemod.net",
  imoddrive: "https://ev.iphonemod.net",
};

// GET /api/analytics/content - Get content analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site") || "imod";
  const period = searchParams.get("period") || "week"; // week, month

  try {
    const wpUrl = WP_SITES[site as keyof typeof WP_SITES] || WP_SITES.imod;

    // Calculate date range
    const now = new Date();
    const afterDate = period === "week"
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch recent articles
    const articlesRes = await fetch(
      `${wpUrl}/wp-json/wp/v2/posts?per_page=100&after=${afterDate}&_embed=author,wp:term`,
      { next: { revalidate: 300 } }
    );

    if (!articlesRes.ok) {
      throw new Error("Failed to fetch articles");
    }

    const articles = await articlesRes.json();
    const totalArticles = parseInt(articlesRes.headers.get("X-WP-Total") || "0");

    // Analyze by author
    const byAuthor: Record<string, { name: string; count: number }> = {};
    const byCategory: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    for (const article of articles) {
      // Author
      const authorName = article._embedded?.author?.[0]?.name || "Unknown";
      const authorId = article.author;
      if (!byAuthor[authorId]) {
        byAuthor[authorId] = { name: authorName, count: 0 };
      }
      byAuthor[authorId].count++;

      // Categories
      if (article._embedded?.["wp:term"]?.[0]) {
        for (const cat of article._embedded["wp:term"][0]) {
          byCategory[cat.name] = (byCategory[cat.name] || 0) + 1;
        }
      }

      // Tags
      if (article._embedded?.["wp:term"]?.[1]) {
        for (const tag of article._embedded["wp:term"][1]) {
          byTag[tag.name] = (byTag[tag.name] || 0) + 1;
        }
      }

      // Daily
      const date = article.date.split("T")[0];
      byDay[date] = (byDay[date] || 0) + 1;
    }

    // Top authors
    const topAuthors = Object.values(byAuthor)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top categories
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top tags
    const topTags = Object.entries(byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    // Daily trend
    const dailyTrend = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Calculate averages
    const days = period === "week" ? 7 : new Date().getDate();
    const avgPerDay = totalArticles / days;

    return NextResponse.json({
      success: true,
      site,
      period,
      stats: {
        totalArticles,
        avgPerDay: Math.round(avgPerDay * 10) / 10,
        uniqueAuthors: Object.keys(byAuthor).length,
        uniqueCategories: Object.keys(byCategory).length,
      },
      topAuthors,
      topCategories,
      topTags,
      dailyTrend,
    });
  } catch (error) {
    console.error("Content analytics error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
