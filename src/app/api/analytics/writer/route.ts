import { NextRequest, NextResponse } from "next/server";

// WordPress API credentials
const WP_SITES = {
  imod: {
    url: "https://www.iphonemod.net",
    username: "iMod Crew",
    password: "rvXh IEwO fede XgI9 5h3O wV1u",
  },
  imoddrive: {
    url: "https://ev.iphonemod.net",
    username: "imoddrive",
    password: "ORVa Fe5v ECJQ Kcwc Vxnh IFL4",
  },
};

// Author ID mapping
const AUTHOR_MAP: Record<string, number> = {
  "1465635163466633308": 1,   // พี่ต้อม -> attapon
  "1006485307434209373": 12,  // พี่เต็นท์
  "1465626357437435969": 20,  // พี่ซา
  "1467722118388256884": 52,  // พี่กิ๊ฟ
  "470479651475685387": 53,   // kan
  "1415292248546873406": 49,  // Art
  "756874861682491443": 55,   // บัยคุน
};

// GET /api/analytics/writer - Get writer analytics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const discordId = searchParams.get("discordId");
  const authorId = searchParams.get("authorId");
  const site = searchParams.get("site") || "imod";
  const period = searchParams.get("period") || "month"; // week, month, year
  
  try {
    const wpSite = WP_SITES[site as keyof typeof WP_SITES] || WP_SITES.imod;
    const wpAuthorId = authorId || (discordId ? AUTHOR_MAP[discordId] : null);

    if (!wpAuthorId) {
      return NextResponse.json(
        { success: false, error: "Author ID required" },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    let afterDate: string;
    if (period === "week") {
      afterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === "year") {
      afterDate = new Date(now.getFullYear(), 0, 1).toISOString();
    } else {
      afterDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    // Fetch articles by author
    const articlesRes = await fetch(
      `${wpSite.url}/wp-json/wp/v2/posts?author=${wpAuthorId}&per_page=100&after=${afterDate}&_embed=author`,
      { next: { revalidate: 300 } }
    );

    let articles: any[] = [];
    let totalArticles = 0;
    let categories: Record<string, number> = {};
    let tags: Record<string, number> = {};

    if (articlesRes.ok) {
      articles = await articlesRes.json();
      totalArticles = parseInt(articlesRes.headers.get("X-WP-Total") || "0");

      // Analyze categories and tags
      for (const article of articles) {
        // Categories
        if (article._embedded?.["wp:term"]?.[0]) {
          for (const cat of article._embedded["wp:term"][0]) {
            categories[cat.name] = (categories[cat.name] || 0) + 1;
          }
        }
        // Tags
        if (article._embedded?.["wp:term"]?.[1]) {
          for (const tag of article._embedded["wp:term"][1]) {
            tags[tag.name] = (tags[tag.name] || 0) + 1;
          }
        }
      }
    }

    // Recent articles with details
    const recentArticles = articles.slice(0, 10).map((article) => ({
      id: article.id,
      title: article.title.rendered.replace(/<[^>]+>/g, ""),
      url: article.link,
      date: article.date,
      status: article.status,
    }));

    // Calculate daily breakdown
    const dailyBreakdown: Record<string, number> = {};
    for (const article of articles) {
      const date = article.date.split("T")[0];
      dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
    }

    // Top categories
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top tags
    const topTags = Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      success: true,
      authorId: wpAuthorId,
      site,
      period,
      stats: {
        totalArticles,
        articlesThisPeriod: articles.length,
        avgPerDay: articles.length / (period === "week" ? 7 : period === "year" ? 365 : 30),
      },
      topCategories,
      topTags,
      dailyBreakdown,
      recentArticles,
    });
  } catch (error) {
    console.error("Writer analytics error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
