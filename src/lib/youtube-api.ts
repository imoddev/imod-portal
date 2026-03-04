// YouTube Data API v3 Integration

const CHANNEL_ID = "UCC1hWOd-EtRNuqVKkOyPLXQ"; // iMoD Official

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

interface ChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

// Get API key from settings file or env
async function getApiKey(): Promise<string | null> {
  // Try env first
  if (process.env.YOUTUBE_API_KEY) {
    return process.env.YOUTUBE_API_KEY;
  }
  
  // Try settings file
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const settingsPath = path.join(process.cwd(), "data", "settings.json");
    const data = await fs.readFile(settingsPath, "utf-8");
    const settings = JSON.parse(data);
    return settings.youtube?.apiKey || null;
  } catch {
    return null;
  }
}

export async function getChannelStats(): Promise<ChannelStats | null> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.warn("No YouTube API key configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${apiKey}`,
      { next: { revalidate: 300 } } // Cache 5 minutes
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const stats = data.items?.[0]?.statistics;

    if (!stats) return null;

    return {
      subscriberCount: parseInt(stats.subscriberCount) || 0,
      viewCount: parseInt(stats.viewCount) || 0,
      videoCount: parseInt(stats.videoCount) || 0,
    };
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    return null;
  }
}

export async function getRecentVideos(maxResults = 10): Promise<YouTubeVideo[]> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.warn("No YouTube API key configured");
    return [];
  }

  try {
    // Search for recent videos
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(",");

    if (!videoIds) return [];

    // Get video details (including stats)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    return videosData.items?.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      duration: parseDuration(item.contentDetails?.duration),
      viewCount: parseInt(item.statistics?.viewCount) || 0,
      likeCount: parseInt(item.statistics?.likeCount) || 0,
      commentCount: parseInt(item.statistics?.commentCount) || 0,
    })) || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export async function getVideoById(videoId: string): Promise<YouTubeVideo | null> {
  const apiKey = await getApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const item = data.items?.[0];

    if (!item) return null;

    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt,
      duration: parseDuration(item.contentDetails?.duration),
      viewCount: parseInt(item.statistics?.viewCount) || 0,
      likeCount: parseInt(item.statistics?.likeCount) || 0,
      commentCount: parseInt(item.statistics?.commentCount) || 0,
    };
  } catch {
    return null;
  }
}

// Parse ISO 8601 duration to readable format
function parseDuration(duration: string): string {
  if (!duration) return "";
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
