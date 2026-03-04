import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/news/add - Add new news item(s) to database
// Can be called by AI agents to add news directly
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both single item and array
    const items = Array.isArray(body) ? body : [body];
    
    const results = {
      added: 0,
      duplicates: 0,
      errors: [] as string[],
    };

    for (const item of items) {
      // Validate required fields
      if (!item.title || !item.sourceUrl) {
        results.errors.push(`Missing title or sourceUrl: ${item.title || 'no title'}`);
        continue;
      }

      // Check for duplicate by URL
      const existing = await prisma.newsItem.findFirst({
        where: { sourceUrl: item.sourceUrl },
      });

      if (existing) {
        results.duplicates++;
        continue;
      }

      // Create news item
      await prisma.newsItem.create({
        data: {
          date: item.date || new Date().toISOString().split("T")[0],
          time: item.time || new Date().toTimeString().slice(0, 5),
          source: item.source || extractDomain(item.sourceUrl),
          category: item.category || "Tech",
          title: item.title,
          sourceUrl: item.sourceUrl,
          summary: item.summary || "",
          selectedBy: item.selectedBy || "AI Agent",
          team: item.team || "it",
          status: "available",
          notes: item.notes || "",
        },
      });
      
      results.added++;
    }

    return NextResponse.json({
      success: true,
      message: `Added ${results.added} news items`,
      ...results,
    });
  } catch (error) {
    console.error("Error adding news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Extract domain from URL for source
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return "Unknown";
  }
}
