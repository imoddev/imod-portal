import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Newspaper, 
  DollarSign, 
  Video, 
  ClipboardList,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import { fetchAllRecentArticles, getTodayArticleCount } from "@/lib/wordpress";
import Link from "next/link";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function DashboardPage() {
  // Fetch real data
  const [articles, todayCount] = await Promise.all([
    fetchAllRecentArticles(8),
    getTodayArticleCount(),
  ]);

  const totalToday = todayCount.iphonemod + todayCount.evmod;

  const stats = [
    {
      title: "บทความวันนี้",
      value: totalToday.toString(),
      change: `iMoD: ${todayCount.iphonemod} | Drive: ${todayCount.evmod}`,
      icon: Newspaper,
      color: "text-blue-600",
    },
    {
      title: "Revenue Pipeline",
      value: "฿1.2M",
      change: "5 deals active",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Production Tasks",
      value: "8",
      change: "3 in progress",
      icon: Video,
      color: "text-purple-600",
    },
    {
      title: "Activities Today",
      value: "24",
      change: "From 6 members",
      icon: ClipboardList,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          ภาพรวมการทำงานของ iMoD Team วันนี้
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Articles - Real Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              บทความล่าสุด
            </CardTitle>
            <CardDescription>บทความที่เพิ่งเผยแพร่จากทั้งสองเว็บ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={`${article.site}-${article.id}`} className="flex items-start gap-3">
                  <Badge variant={article.site === "iphonemod" ? "default" : "secondary"} className="mt-0.5 shrink-0">
                    {article.site === "iphonemod" ? "iMoD" : "Drive"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={article.url} 
                      target="_blank"
                      className="text-sm font-medium hover:underline line-clamp-1 flex items-center gap-1"
                    >
                      {article.title}
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {article.author} • {formatRelativeTime(article.publishedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              สรุปวันนี้
            </CardTitle>
            <CardDescription>ภาพรวมการทำงานประจำวัน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">iMoD</p>
                  <p className="text-sm text-muted-foreground">บทความวันนี้</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{todayCount.iphonemod}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">iMoD Drive</p>
                  <p className="text-sm text-muted-foreground">บทความวันนี้</p>
                </div>
                <span className="text-2xl font-bold text-green-600">{todayCount.evmod}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">รวมทั้งหมด</p>
                  <p className="text-sm text-muted-foreground">บทความวันนี้</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">{totalToday}</span>
              </div>
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
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
