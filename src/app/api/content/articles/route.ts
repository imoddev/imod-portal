import { NextResponse } from "next/server";

interface WPArticle {
  id: number;
  title: string;
  slug: string;
  date: string;
  author: string;
  views?: number;
  url: string;
  site: "iphonemod" | "evmod";
  featuredImage?: string;
}

// WordPress REST API endpoints
const WP_SITES = {
  iphonemod: {
    name: "iphonemod",
    baseUrl: "https://www.iphonemod.net",
    apiUrl: "https://www.iphonemod.net/wp-json/wp/v2",
  },
  evmod: {
    name: "evmod",
    baseUrl: "https://ev.iphonemod.net",
    apiUrl: "https://ev.iphonemod.net/wp-json/wp/v2",
  },
};

// Fetch articles from a WordPress site
async function fetchFromWP(
  site: keyof typeof WP_SITES,
  count: number = 10
): Promise<WPArticle[]> {
  const siteConfig = WP_SITES[site];
  
  try {
    // Add timestamp to bust cache
    const timestamp = Date.now();
    
    // Fetch posts with embedded author and featured media
    const response = await fetch(
      `${siteConfig.apiUrl}/posts?per_page=${count}&_embed=author,wp:featuredmedia&orderby=date&order=desc&_=${timestamp}`,
      {
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
        cache: "no-store", // Always fetch fresh
        next: { revalidate: 0 }, // Disable Next.js cache
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch from ${site}: ${response.status}`);
      return [];
    }

    const posts = await response.json();

    return posts.map((post: any) => {
      // Get author name from embedded data
      let authorName = "Unknown";
      if (post._embedded?.author?.[0]?.name) {
        authorName = post._embedded.author[0].name;
      }

      // Get featured image from embedded data
      let featuredImage: string | undefined;
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      if (media) {
        // Try to get medium size first, then thumbnail, then full
        featuredImage = 
          media.media_details?.sizes?.medium?.source_url ||
          media.media_details?.sizes?.thumbnail?.source_url ||
          media.source_url;
      }

      // Decode HTML entities in title
      const rawTitle = post.title?.rendered || "Untitled";
      const title = rawTitle
        .replace(/&#8211;/g, "-")
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ");

      return {
        id: post.id,
        title,
        slug: post.slug,
        date: post.date,
        author: authorName,
        url: post.link || `${siteConfig.baseUrl}/${post.slug}`,
        site: siteConfig.name as "iphonemod" | "evmod",
        featuredImage,
      };
    });
  } catch (error) {
    console.error(`Error fetching from ${site}:`, error);
    return [];
  }
}

// GET /api/content/articles - Fetch latest articles from both sites
export async function GET() {
  try {
    // Fetch from both sites in parallel
    const [imodArticles, evArticles] = await Promise.all([
      fetchFromWP("iphonemod", 15),
      fetchFromWP("evmod", 15),
    ]);

    // Combine and sort by date
    const allArticles = [...imodArticles, ...evArticles].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      articles: allArticles,
      counts: {
        iphonemod: imodArticles.length,
        evmod: evArticles.length,
        total: allArticles.length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { success: false, error: String(error), articles: [] },
      { status: 500 }
    );
  }
}
