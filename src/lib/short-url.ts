// Short URL Generator using Short.io API
// Domain: imods.cc

const SHORT_IO_API_KEY = "sk_21ZlwbgZsevwCUoh";
const SHORT_IO_DOMAIN = "imods.cc";

interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

interface ShortUrlData {
  originalUrl: string;
  slug?: string; // Custom slug (optional)
  title?: string;
}

export async function createShortUrl(data: ShortUrlData): Promise<ShortUrlResult> {
  try {
    const response = await fetch("https://api.short.io/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: SHORT_IO_API_KEY,
      },
      body: JSON.stringify({
        domain: SHORT_IO_DOMAIN,
        originalURL: data.originalUrl,
        path: data.slug || undefined,
        title: data.title || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Short.io error:", error);
      return { success: false, error: `API error: ${response.status}` };
    }

    const result = await response.json();
    
    return {
      success: true,
      shortUrl: result.shortURL || `https://${SHORT_IO_DOMAIN}/${result.path}`,
    };
  } catch (error) {
    console.error("Error creating short URL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// Get existing short URL or create new one
export async function getOrCreateShortUrl(originalUrl: string): Promise<ShortUrlResult> {
  try {
    // First, try to find existing
    const searchResponse = await fetch(
      `https://api.short.io/links?domain=${SHORT_IO_DOMAIN}&originalURL=${encodeURIComponent(originalUrl)}`,
      {
        headers: {
          Authorization: SHORT_IO_API_KEY,
        },
      }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.links && searchResult.links.length > 0) {
        return {
          success: true,
          shortUrl: searchResult.links[0].shortURL,
        };
      }
    }

    // Not found, create new
    return createShortUrl({ originalUrl });
  } catch (error) {
    // If search fails, try to create
    return createShortUrl({ originalUrl });
  }
}

// Get stats for a short URL
export async function getShortUrlStats(shortUrl: string): Promise<{
  clicks: number;
  uniqueClicks: number;
} | null> {
  try {
    const path = shortUrl.replace(`https://${SHORT_IO_DOMAIN}/`, "");
    
    const response = await fetch(
      `https://api.short.io/links/statistics?domain=${SHORT_IO_DOMAIN}&path=${path}`,
      {
        headers: {
          Authorization: SHORT_IO_API_KEY,
        },
      }
    );

    if (!response.ok) return null;

    const result = await response.json();
    
    return {
      clicks: result.totalClicks || 0,
      uniqueClicks: result.humanClicks || 0,
    };
  } catch {
    return null;
  }
}

// Generate a suggested slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Remove multiple dashes
    .slice(0, 30) // Limit length
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}
