// WordPress Post API - Create drafts on WordPress

interface WPCredentials {
  url: string;
  username: string;
  appPassword: string;
}

interface PostData {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  status?: "draft" | "publish" | "pending" | "private";
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: {
    _yoast_wpseo_focuskw?: string;
    _yoast_wpseo_metadesc?: string;
  };
}

interface WPPostResponse {
  id: number;
  link: string;
  status: string;
  title: { rendered: string };
}

// WordPress credentials from TOOLS.md
const WP_SITES: Record<string, WPCredentials> = {
  imod: {
    url: "https://www.iphonemod.net",
    username: "iMod Crew", // Lucus account
    appPassword: "rvXh IEwO fede XgI9 5h3O wV1u",
  },
  imoddrive: {
    url: "https://ev.iphonemod.net",
    username: "imoddrive", // Lucus account
    appPassword: "ORVa Fe5v ECJQ Kcwc Vxnh IFL4",
  },
};

// Author mapping (Discord ID → WP Author ID)
const AUTHOR_MAP: Record<string, number> = {
  "1006485307434209373": 12, // พี่เต็นท์
  "1465635163466633308": 1,  // พี่ต้อม
  "1465626357437435969": 20, // พี่ซา
  "1467722118388256884": 52, // พี่กิ๊ฟ
  "470479651475685387": 53,  // Kan
  "1415292248546873406": 49, // อาร์ต
  "756874861682491443": 55,  // บัยคุน
};

function getAuthHeader(site: WPCredentials): string {
  const credentials = `${site.username}:${site.appPassword}`;
  const encoded = Buffer.from(credentials).toString("base64");
  return `Basic ${encoded}`;
}

export async function createWordPressDraft(
  site: "imod" | "imoddrive",
  post: PostData,
  authorDiscordId?: string
): Promise<{ success: boolean; postId?: number; editUrl?: string; error?: string }> {
  const wpSite = WP_SITES[site];
  
  if (!wpSite) {
    return { success: false, error: "Invalid site" };
  }

  try {
    const body: any = {
      title: post.title,
      content: post.content,
      status: post.status || "draft",
      excerpt: post.excerpt || "",
      slug: post.slug || "",
    };

    // Set author if Discord ID provided
    if (authorDiscordId && AUTHOR_MAP[authorDiscordId]) {
      body.author = AUTHOR_MAP[authorDiscordId];
    }

    // Add categories and tags if provided
    if (post.categories?.length) {
      body.categories = post.categories;
    }
    if (post.tags?.length) {
      body.tags = post.tags;
    }

    const response = await fetch(`${wpSite.url}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(wpSite),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WordPress API error:", errorText);
      return { 
        success: false, 
        error: `WordPress API error: ${response.status}` 
      };
    }

    const result: WPPostResponse = await response.json();
    
    // Generate edit URL
    const editUrl = `${wpSite.url}/wp-admin/post.php?post=${result.id}&action=edit`;

    return {
      success: true,
      postId: result.id,
      editUrl,
    };
  } catch (error) {
    console.error("Error creating WordPress draft:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// Search categories by name
export async function searchCategories(
  site: "imod" | "imoddrive",
  search: string
): Promise<{ id: number; name: string }[]> {
  const wpSite = WP_SITES[site];
  
  try {
    const response = await fetch(
      `${wpSite.url}/wp-json/wp/v2/categories?search=${encodeURIComponent(search)}&per_page=10`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) return [];

    const categories = await response.json();
    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
    }));
  } catch {
    return [];
  }
}

// Search tags by name
export async function searchTags(
  site: "imod" | "imoddrive",
  search: string
): Promise<{ id: number; name: string }[]> {
  const wpSite = WP_SITES[site];
  
  try {
    const response = await fetch(
      `${wpSite.url}/wp-json/wp/v2/tags?search=${encodeURIComponent(search)}&per_page=10`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];

    const tags = await response.json();
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
    }));
  } catch {
    return [];
  }
}

// Create tag if not exists
export async function createTag(
  site: "imod" | "imoddrive",
  name: string
): Promise<number | null> {
  const wpSite = WP_SITES[site];
  
  try {
    const response = await fetch(`${wpSite.url}/wp-json/wp/v2/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(wpSite),
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) return null;

    const tag = await response.json();
    return tag.id;
  } catch {
    return null;
  }
}
