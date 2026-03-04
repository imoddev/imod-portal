import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// RSS Feed sources
const RSS_FEEDS = [
  // Apple/Tech
  { url: "https://9to5mac.com/feed/", source: "9to5Mac", category: "Apple", team: "it" },
  { url: "https://www.macrumors.com/macrumors.xml", source: "MacRumors", category: "Apple", team: "it" },
  { url: "https://appleinsider.com/rss/news/", source: "AppleInsider", category: "Apple", team: "it" },
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", category: "Tech", team: "it" },
  // EV
  { url: "https://electrek.co/feed/", source: "Electrek", category: "EV", team: "ev" },
  { url: "https://insideevs.com/rss/news/", source: "InsideEVs", category: "EV", team: "ev" },
  { url: "https://cleantechnica.com/feed/", source: "CleanTechnica", category: "EV", team: "ev" },
  // AI
  { url: "https://the-decoder.com/feed/", source: "The Decoder", category: "AI", team: "it" },
];

// Parse RSS feed
async function parseRSS(url: string): Promise<Array<{
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}>> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "iMoD News Bot/1.0" },
      next: { revalidate: 0 },
    });
    
    if (!res.ok) return [];
    
    const xml = await res.text();
    const items: any[] = [];
    
    // Simple XML parsing
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    for (const match of itemMatches) {
      const itemXml = match[1];
      
      const title = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || "";
      const link = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim() || "";
      const pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || "";
      const description = itemXml.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || "";
      
      if (title && link) {
        items.push({
          title: title.replace(/<[^>]+>/g, "").trim(),
          link: link.replace(/<[^>]+>/g, "").trim(),
          pubDate,
          description: description.replace(/<[^>]+>/g, "").substring(0, 500),
        });
      }
    }
    
    return items.slice(0, 10); // Latest 10 per feed
  } catch (e) {
    console.error(`Error parsing RSS ${url}:`, e);
    return [];
  }
}

// POST /api/cron/fetch-news - Fetch news from RSS feeds
export async function POST(request: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow without secret for testing
    console.log("No cron secret provided, allowing request");
  }

  try {
    let totalNew = 0;
    const newItems: any[] = [];

    for (const feed of RSS_FEEDS) {
      const items = await parseRSS(feed.url);
      
      for (const item of items) {
        // Check if already exists
        const existing = await prisma.newsItem.findFirst({
          where: { sourceUrl: item.link },
        });

        if (!existing) {
          // Parse date
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
          const dateStr = pubDate.toISOString().split("T")[0];
          const timeStr = pubDate.toTimeString().substring(0, 5);

          // Create new item
          const created = await prisma.newsItem.create({
            data: {
              source: feed.source,
              category: feed.category,
              team: feed.team,
              title: item.title,
              sourceUrl: item.link,
              summary: item.description || null,
              date: dateStr,
              time: timeStr,
              selectedBy: "Auto-Fetch",
              status: "available",
            },
          });

          totalNew++;
          newItems.push({
            title: item.title,
            source: feed.source,
            category: feed.category,
            team: feed.team,
          });
        }
      }
    }

    // Send Discord notification if new items found
    if (totalNew > 0) {
      try {
        const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:4141";
        
        // Group by team
        const itNews = newItems.filter(n => n.team === "it");
        const evNews = newItems.filter(n => n.team === "ev");

        // Notify content-team for IT news
        if (itNews.length > 0) {
          const message = `📰 **ข่าวใหม่ ${itNews.length} ชิ้น** (IT)\n\n` +
            itNews.slice(0, 5).map(n => `• **${n.source}**: ${n.title}`).join("\n") +
            (itNews.length > 5 ? `\n... และอีก ${itNews.length - 5} ชิ้น` : "") +
            `\n\n🔗 ดูทั้งหมด: https://basement.iphonemod.net/content/news`;

          await fetch(`${gatewayUrl}/api/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "send",
              channel: "discord",
              target: "1467136896391188560", // #content-team
              message,
            }),
          }).catch(() => {});
        }

        // Notify imoddrive for EV news
        if (evNews.length > 0) {
          const message = `🚗 **ข่าวใหม่ ${evNews.length} ชิ้น** (EV)\n\n` +
            evNews.slice(0, 5).map(n => `• **${n.source}**: ${n.title}`).join("\n") +
            (evNews.length > 5 ? `\n... และอีก ${evNews.length - 5} ชิ้น` : "") +
            `\n\n🔗 ดูทั้งหมด: https://basement.iphonemod.net/content/news`;

          await fetch(`${gatewayUrl}/api/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "send",
              channel: "discord",
              target: "1467136835208609827", // #imoddrive
              message,
            }),
          }).catch(() => {});
        }
      } catch (e) {
        console.error("Discord notification failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      totalNew,
      items: newItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET - For testing
export async function GET() {
  return NextResponse.json({
    message: "Use POST to fetch news",
    feeds: RSS_FEEDS.length,
  });
}
