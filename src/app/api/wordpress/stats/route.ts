import { NextRequest, NextResponse } from "next/server";

const WP_SITES = {
  imod: {
    name: "iMoD",
    apiUrl: "https://www.iphonemod.net/wp-json/wp/v2",
    baseUrl: "https://www.iphonemod.net",
  },
  ev: {
    name: "iMoD Drive",
    apiUrl: "https://ev.iphonemod.net/wp-json/wp/v2",
    baseUrl: "https://ev.iphonemod.net",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site") || "imod";
  
  const siteConfig = WP_SITES[site as keyof typeof WP_SITES];
  if (!siteConfig) {
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  }

  try {
    const timestamp = Date.now();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    // Fetch recent posts with featured media
    const postsRes = await fetch(
      `${siteConfig.apiUrl}/posts?per_page=10&_embed=author,wp:featuredmedia&orderby=date&order=desc&_=${timestamp}`,
      {
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }
    );

    if (!postsRes.ok) {
      throw new Error(`WordPress API error: ${postsRes.status}`);
    }

    const posts = await postsRes.json();
    
    // Count today's posts
    const todayPosts = posts.filter((post: any) => {
      const postDate = new Date(post.date);
      postDate.setHours(0, 0, 0, 0);
      return postDate.getTime() === today.getTime();
    }).length;

    // Format recent posts
    const recentPosts = posts.map((post: any) => {
      // Get author
      const author = post._embedded?.author?.[0]?.name || "Unknown";
      
      // Get featured image
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      const featuredImage = media?.media_details?.sizes?.thumbnail?.source_url || 
                           media?.media_details?.sizes?.medium?.source_url ||
                           media?.source_url;

      // Decode HTML entities
      const title = (post.title?.rendered || "Untitled")
        .replace(/&#8211;/g, "-")
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ");

      return {
        id: post.id,
        title,
        date: post.date,
        author,
        url: post.link,
        featuredImage,
      };
    });

    // Get total posts count
    const totalRes = await fetch(
      `${siteConfig.apiUrl}/posts?per_page=1&_=${timestamp}`,
      {
        headers: { "Accept": "application/json" },
        cache: "no-store",
      }
    );
    
    const totalPosts = parseInt(totalRes.headers.get("X-WP-Total") || "0");

    return NextResponse.json({
      site: site,
      siteName: siteConfig.name,
      totalPosts,
      todayPosts,
      recentPosts,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error fetching ${site} stats:`, error);
    return NextResponse.json(
      { 
        error: String(error),
        site,
        totalPosts: 0,
        todayPosts: 0,
        recentPosts: [],
      },
      { status: 500 }
    );
  }
}
