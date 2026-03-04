// Duplicate Checker - Check if news/article already exists

import { fetchAllRecentArticles } from "./wordpress";

interface DuplicateResult {
  isDuplicate: boolean;
  confidence: number; // 0-100
  matchedArticle?: {
    title: string;
    url: string;
    publishedAt: string;
    similarity: number;
  };
  similarArticles: {
    title: string;
    url: string;
    similarity: number;
  }[];
}

// Simple word tokenizer
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s]/g, "") // Keep Thai and alphanumeric
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

// Calculate Jaccard similarity between two sets
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

// Calculate similarity between two titles
function calculateSimilarity(title1: string, title2: string): number {
  const tokens1 = new Set(tokenize(title1));
  const tokens2 = new Set(tokenize(title2));
  
  return jaccardSimilarity(tokens1, tokens2);
}

// Extract key entities from title
function extractKeyEntities(title: string): string[] {
  const patterns = [
    /iPhone\s*\d+/gi,
    /iPad\s*(Pro|Air|mini)?/gi,
    /MacBook\s*(Pro|Air)?/gi,
    /Apple\s*Watch/gi,
    /iOS\s*\d+/gi,
    /macOS\s*\w+/gi,
    /Tesla\s*(Model\s*[SXY3])?/gi,
    /BYD\s*\w+/gi,
    /Samsung\s*Galaxy\s*\w+/gi,
    /Google\s*Pixel\s*\d+/gi,
  ];

  const entities: string[] = [];
  for (const pattern of patterns) {
    const matches = title.match(pattern);
    if (matches) {
      entities.push(...matches.map((m) => m.toLowerCase().trim()));
    }
  }

  return [...new Set(entities)];
}

// Check for duplicate in WordPress
export async function checkDuplicate(
  title: string,
  site: "imod" | "imoddrive" | "both" = "both"
): Promise<DuplicateResult> {
  try {
    // Fetch recent articles (last 100)
    const articles = await fetchAllRecentArticles(100);
    
    // Filter by site if specified
    const targetArticles = site === "both" 
      ? articles 
      : articles.filter((a) => 
          site === "imod" ? a.site === "iphonemod" : a.site === "evmod"
        );

    const inputEntities = extractKeyEntities(title);
    const similarArticles: DuplicateResult["similarArticles"] = [];
    let bestMatch: DuplicateResult["matchedArticle"] | undefined;
    let highestSimilarity = 0;

    for (const article of targetArticles) {
      const similarity = calculateSimilarity(title, article.title);
      
      // Also check entity overlap
      const articleEntities = extractKeyEntities(article.title);
      const entityOverlap = inputEntities.some((e) => 
        articleEntities.some((ae) => ae.includes(e) || e.includes(ae))
      );

      // Boost similarity if key entities match
      const adjustedSimilarity = entityOverlap ? Math.min(similarity + 20, 100) : similarity;

      if (adjustedSimilarity > 30) {
        similarArticles.push({
          title: article.title,
          url: article.url,
          similarity: Math.round(adjustedSimilarity),
        });
      }

      if (adjustedSimilarity > highestSimilarity) {
        highestSimilarity = adjustedSimilarity;
        bestMatch = {
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          similarity: Math.round(adjustedSimilarity),
        };
      }
    }

    // Sort by similarity
    similarArticles.sort((a, b) => b.similarity - a.similarity);

    // Determine if duplicate (threshold: 60%)
    const isDuplicate = highestSimilarity >= 60;

    return {
      isDuplicate,
      confidence: Math.round(highestSimilarity),
      matchedArticle: highestSimilarity >= 30 ? bestMatch : undefined,
      similarArticles: similarArticles.slice(0, 5), // Top 5
    };
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return {
      isDuplicate: false,
      confidence: 0,
      similarArticles: [],
    };
  }
}

// Quick check by URL
export async function checkDuplicateByUrl(url: string): Promise<boolean> {
  try {
    const articles = await fetchAllRecentArticles(100);
    
    // Check if any article references this URL
    return articles.some((article) => {
      // Check if the URL appears in the content or source
      return article.url.includes(url) || url.includes(article.url);
    });
  } catch {
    return false;
  }
}
