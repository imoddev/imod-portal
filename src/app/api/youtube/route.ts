import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChannelStats, getRecentVideos, getVideoById } from "@/lib/youtube-api";

// GET /api/youtube - Get channel stats and recent videos
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "overview";
    const videoId = searchParams.get("videoId");
    const limit = parseInt(searchParams.get("limit") || "10");

    switch (action) {
      case "stats":
        const stats = await getChannelStats();
        if (!stats) {
          return NextResponse.json(
            { error: "Failed to fetch stats. Check API key." },
            { status: 500 }
          );
        }
        return NextResponse.json(stats);

      case "videos":
        const videos = await getRecentVideos(limit);
        return NextResponse.json(videos);

      case "video":
        if (!videoId) {
          return NextResponse.json(
            { error: "videoId is required" },
            { status: 400 }
          );
        }
        const video = await getVideoById(videoId);
        if (!video) {
          return NextResponse.json(
            { error: "Video not found" },
            { status: 404 }
          );
        }
        return NextResponse.json(video);

      case "overview":
      default:
        const [channelStats, recentVideos] = await Promise.all([
          getChannelStats(),
          getRecentVideos(limit),
        ]);

        return NextResponse.json({
          stats: channelStats,
          videos: recentVideos,
          hasApiKey: !!channelStats,
        });
    }
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
