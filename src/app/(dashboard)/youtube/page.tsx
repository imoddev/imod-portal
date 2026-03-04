import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Youtube,
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  Play,
  TrendingUp,
  ExternalLink,
  Clock,
} from "lucide-react";
import { getRecentVideos, getChannelStats, formatDuration, formatViewCount } from "@/lib/youtube";
import Link from "next/link";

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function YouTubePage() {
  const [videos, stats] = await Promise.all([
    getRecentVideos(8),
    getChannelStats(),
  ]);

  // Calculate totals from recent videos
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Youtube className="h-6 w-6 text-red-600" />
            YouTube Analytics
          </h1>
          <p className="text-muted-foreground">
            iMoD Official Channel
          </p>
        </div>
        <Link
          href="https://www.youtube.com/@imodofficial"
          target="_blank"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          เปิดใน YouTube
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats ? formatViewCount(stats.subscriberCount) : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{formatViewCount(totalViews)}</p>
                <p className="text-sm text-muted-foreground">Views (Recent)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatViewCount(avgViews)}</p>
                <p className="text-sm text-muted-foreground">Avg. Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats ? stats.videoCount : videos.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos */}
      <Card>
        <CardHeader>
          <CardTitle>วิดีโอล่าสุด</CardTitle>
          <CardDescription>วิดีโอที่อัปโหลดล่าสุดจากช่อง</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                className="flex gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-40 h-24 object-cover rounded"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2 group-hover:text-primary">
                    {video.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatRelativeTime(video.publishedAt)}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatViewCount(video.viewCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {formatViewCount(video.likeCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {video.commentCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔥 Most Viewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...videos]
                .sort((a, b) => b.viewCount - a.viewCount)
                .slice(0, 3)
                .map((video, index) => (
                  <div key={video.id} className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatViewCount(video.viewCount)} views
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">💬 Most Engaged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...videos]
                .sort((a, b) => b.commentCount - a.commentCount)
                .slice(0, 3)
                .map((video, index) => (
                  <div key={video.id} className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-6">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.commentCount} comments • {formatViewCount(video.likeCount)} likes
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "วันนี้";
  if (diffDays === 1) return "เมื่อวาน";
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
  
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
