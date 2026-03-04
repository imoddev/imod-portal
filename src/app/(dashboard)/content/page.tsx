"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  ExternalLink,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface WPArticle {
  id: number;
  title: string;
  slug: string;
  date: string;
  author: string;
  views?: number;
  url: string;
  site: "iphonemod" | "evmod";
  featuredImage?: string;
}

export default function ContentPage() {
  const [articles, setArticles] = useState<WPArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch articles
  const fetchArticles = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await fetch("/api/content/articles");
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Group by site
  const imodArticles = articles.filter((a) => a.site === "iphonemod");
  const evArticles = articles.filter((a) => a.site === "evmod");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Hub</h1>
          <p className="text-muted-foreground">
            บทความจากทั้งสองเว็บไซต์
            {lastRefresh && (
              <span className="ml-2 text-xs">
                (อัปเดตล่าสุด: {lastRefresh.toLocaleTimeString("th-TH")})
              </span>
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchArticles(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isRefreshing ? "กำลังโหลด..." : "Refresh"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* iMoD Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>iMoD</Badge>
                iphonemod.net
              </CardTitle>
              <CardDescription>
                บทความล่าสุดจาก iMoD ({imodArticles.length} บทความ)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleList articles={imodArticles} />
            </CardContent>
          </Card>

          {/* iMoD Drive Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">EV</Badge>
                iMoD Drive
              </CardTitle>
              <CardDescription>
                บทความล่าสุดจาก iMoD Drive ({evArticles.length} บทความ)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArticleList articles={evArticles} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ArticleList({ articles }: { articles: WPArticle[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-20" />
        <p>ไม่มีบทความ</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {articles.map((article) => (
        <Link
          key={`${article.site}-${article.id}`}
          href={article.url}
          target="_blank"
          className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
        >
          {/* Featured Image */}
          <div className="shrink-0 w-20 h-14 rounded-md overflow-hidden bg-muted">
            {article.featuredImage ? (
              <img
                src={article.featuredImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Newspaper className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{article.author}</span>
              <span>•</span>
              <span>
                {new Date(article.date).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {article.views !== undefined && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* External Link Icon */}
          <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
