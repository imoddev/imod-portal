// YouTube API Integration
// Channel: iMoD Official (UCC1hWOd-EtRNuqVKkOyPLXQ)

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const CHANNEL_ID = "UCC1hWOd-EtRNuqVKkOyPLXQ";

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

export interface ChannelStats {
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export async function getChannelStats(): Promise<ChannelStats | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const stats = data.items?.[0]?.statistics;

    if (!stats) return null;

    return {
      subscriberCount: parseInt(stats.subscriberCount) || 0,
      videoCount: parseInt(stats.videoCount) || 0,
      viewCount: parseInt(stats.viewCount) || 0,
    };
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    return null;
  }
}

export async function getRecentVideos(limit: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    return getMockVideos();
  }

  try {
    // Get recent video IDs
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=${limit}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 1800 } }
    );

    if (!searchResponse.ok) return getMockVideos();

    const searchData = await searchResponse.json();
    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(",");

    if (!videoIds) return getMockVideos();

    // Get video details
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 1800 } }
    );

    if (!videosResponse.ok) return getMockVideos();

    const videosData = await videosResponse.json();

    return videosData.items?.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount) || 0,
      likeCount: parseInt(video.statistics.likeCount) || 0,
      commentCount: parseInt(video.statistics.commentCount) || 0,
      duration: video.contentDetails.duration,
    })) || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return getMockVideos();
  }
}

// Mock data when API is not available
function getMockVideos(): YouTubeVideo[] {
  return [
    {
      id: "abc123",
      title: "iPhone 17 Pro Max รีวิวเต็ม! กล้องดีขึ้นแค่ไหน?",
      thumbnail: "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
      publishedAt: "2026-03-02T10:00:00Z",
      viewCount: 125000,
      likeCount: 5200,
      commentCount: 430,
      duration: "PT15M32S",
    },
    {
      id: "def456",
      title: "Tesla Model Y 2026 ขับครั้งแรก! คุ้มค่าไหม?",
      thumbnail: "https://i.ytimg.com/vi/def456/mqdefault.jpg",
      publishedAt: "2026-03-01T14:00:00Z",
      viewCount: 89000,
      likeCount: 3800,
      commentCount: 320,
      duration: "PT22M15S",
    },
    {
      id: "ghi789",
      title: "BYD Sealion 7 vs Tesla Model Y เทียบกันชัดๆ",
      thumbnail: "https://i.ytimg.com/vi/ghi789/mqdefault.jpg",
      publishedAt: "2026-02-28T09:00:00Z",
      viewCount: 156000,
      likeCount: 6100,
      commentCount: 890,
      duration: "PT28M45S",
    },
    {
      id: "jkl012",
      title: "iOS 20 Beta มีอะไรใหม่? รวมฟีเจอร์เด็ด",
      thumbnail: "https://i.ytimg.com/vi/jkl012/mqdefault.jpg",
      publishedAt: "2026-02-25T11:00:00Z",
      viewCount: 78000,
      likeCount: 2900,
      commentCount: 210,
      duration: "PT12M20S",
    },
  ];
}

export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
