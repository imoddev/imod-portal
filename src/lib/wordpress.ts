// WordPress API Integration

const WP_SITES = {
  iphonemod: {
    url: "https://www.iphonemod.net",
    name: "iPhoneMod",
  },
  evmod: {
    url: "https://ev.iphonemod.net",
    name: "EVMoD",
  },
};

export interface WPArticle {
  id: number;
  title: string;
  url: string;
  author: string;
  authorId: number;
  publishedAt: string;
  site: "iphonemod" | "evmod";
  featuredImage?: string;
}

interface WPPost {
  id: number;
  title: { rendered: string };
  link: string;
  date: string;
  author: number;
  _embedded?: {
    author?: Array<{ name: string }>;
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

export async function fetchRecentArticles(
  site: "iphonemod" | "evmod",
  limit: number = 10
): Promise<WPArticle[]> {
  const siteConfig = WP_SITES[site];
  
  try {
    const response = await fetch(
      `${siteConfig.url}/wp-json/wp/v2/posts?per_page=${limit}&_embed=author,wp:featuredmedia`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      console.error(`Failed to fetch from ${site}:`, response.status);
      return [];
    }

    const posts: WPPost[] = await response.json();

    return posts.map((post) => ({
      id: post.id,
      title: decodeHtmlEntities(post.title.rendered),
      url: post.link,
      author: post._embedded?.author?.[0]?.name || "Unknown",
      authorId: post.author,
      publishedAt: post.date,
      site,
      featuredImage: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
    }));
  } catch (error) {
    console.error(`Error fetching from ${site}:`, error);
    return [];
  }
}

export async function fetchAllRecentArticles(limit: number = 10): Promise<WPArticle[]> {
  const [iphonemod, evmod] = await Promise.all([
    fetchRecentArticles("iphonemod", limit),
    fetchRecentArticles("evmod", limit),
  ]);

  // Combine and sort by date
  return [...iphonemod, ...evmod]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export async function getTodayArticleCount(): Promise<{ iphonemod: number; evmod: number }> {
  const today = new Date().toISOString().split("T")[0];
  
  const [iphonemod, evmod] = await Promise.all([
    fetchRecentArticles("iphonemod", 50),
    fetchRecentArticles("evmod", 50),
  ]);

  return {
    iphonemod: iphonemod.filter((a) => a.publishedAt.startsWith(today)).length,
    evmod: evmod.filter((a) => a.publishedAt.startsWith(today)).length,
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}
