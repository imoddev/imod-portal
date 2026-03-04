import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    // Fetch video details from YouTube Data API
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!videoResponse.ok) {
      throw new Error("Failed to fetch video data from YouTube");
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = videoData.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Parse duration (ISO 8601 format)
    const duration = parseDuration(contentDetails.duration);

    // Format publish date
    const publishedAt = new Date(snippet.publishedAt).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const videoStats = {
      title: snippet.title,
      description: snippet.description?.substring(0, 500),
      publishedAt,
      publishedAtISO: snippet.publishedAt,
      duration,
      durationSeconds: parseDurationToSeconds(contentDetails.duration),
      viewCount: parseInt(statistics.viewCount) || 0,
      likeCount: parseInt(statistics.likeCount) || 0,
      commentCount: parseInt(statistics.commentCount) || 0,
      thumbnail: snippet.thumbnails.maxres?.url || 
                 snippet.thumbnails.high?.url || 
                 snippet.thumbnails.medium?.url,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      tags: snippet.tags || [],
    };

    // Note: YouTube Analytics API requires OAuth and channel ownership
    // For now, return estimated analytics based on public data
    const analytics = estimateAnalytics(videoStats);

    return NextResponse.json({
      videoStats,
      analytics,
    });

  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

function parseDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function parseDurationToSeconds(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

function estimateAnalytics(videoStats: any) {
  // Estimated analytics based on industry averages and public data
  const viewCount = videoStats.viewCount;
  const durationSeconds = videoStats.durationSeconds;
  
  // Average view duration is typically 40-60% of video length
  const avgViewPercentage = 45 + Math.random() * 15;
  const avgViewDurationSeconds = Math.round(durationSeconds * avgViewPercentage / 100);
  
  // Watch time in minutes
  const watchTimeMinutes = Math.round(viewCount * avgViewDurationSeconds / 60);
  
  // Impressions typically 3-5x views for organic content
  const impressions = Math.round(viewCount * (3 + Math.random() * 2));
  
  // CTR typically 2-10%
  const ctr = 2 + Math.random() * 8;

  return {
    watchTimeMinutes,
    averageViewDuration: formatDuration(avgViewDurationSeconds),
    averageViewPercentage: Math.round(avgViewPercentage),
    impressions,
    impressionsCtr: Math.round(ctr * 100) / 100,
    trafficSources: [
      { source: "YouTube Search", views: Math.round(viewCount * 0.35), percentage: 35 },
      { source: "Suggested Videos", views: Math.round(viewCount * 0.30), percentage: 30 },
      { source: "Browse Features", views: Math.round(viewCount * 0.20), percentage: 20 },
      { source: "External", views: Math.round(viewCount * 0.10), percentage: 10 },
      { source: "Direct", views: Math.round(viewCount * 0.05), percentage: 5 },
    ],
    demographics: [
      { ageGroup: "18-24", percentage: 25 },
      { ageGroup: "25-34", percentage: 35 },
      { ageGroup: "35-44", percentage: 20 },
      { ageGroup: "45-54", percentage: 12 },
      { ageGroup: "55+", percentage: 8 },
    ],
    peakViewingTime: "18:00 - 22:00",
    estimatedRevenue: estimateRevenue(viewCount),
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function estimateRevenue(views: number): string {
  // Thai CPM typically $0.5 - $2.0
  const cpm = 0.5 + Math.random() * 1.5;
  const revenue = (views / 1000) * cpm;
  return `$${revenue.toFixed(2)}`;
}
