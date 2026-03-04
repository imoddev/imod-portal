import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const REPORT_BASE_URL = process.env.REPORT_BASE_URL || "https://imod-portal.vercel.app";

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoStats, analytics, language, dateRange, template } = await request.json();

    if (!videoId || !videoStats) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    // Generate unique report ID
    const reportId = uuidv4();

    // Generate AI summary using local Ollama or fallback
    const aiSummary = await generateAISummary(videoStats, analytics, language);

    // Store report data (in production, this would go to a database)
    // For now, we'll return a URL that includes the data as a hash
    const reportData = {
      id: reportId,
      videoId,
      videoStats,
      analytics,
      language,
      dateRange,
      template,
      aiSummary,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days
    };

    // In production: Save to database and return URL
    // For MVP: Return URL with report ID (data stored in memory/cache)
    
    // Store in global cache (simple implementation)
    if (typeof global !== "undefined") {
      (global as any).reportCache = (global as any).reportCache || {};
      (global as any).reportCache[reportId] = reportData;
    }

    const reportUrl = `${REPORT_BASE_URL}/tools/report-generator/view/${reportId}`;
    
    return NextResponse.json({
      reportId,
      reportUrl,
      aiSummary,
      message: "Report generated successfully",
    });

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

async function generateAISummary(
  videoStats: any,
  analytics: any,
  language: string
): Promise<string> {
  const prompt = language === "th" 
    ? `สรุปผลการทำงานของวิดีโอ YouTube นี้แบบสั้นๆ (2-3 ประโยค):
       
       ชื่อวิดีโอ: ${videoStats.title}
       ยอดวิว: ${videoStats.viewCount.toLocaleString()}
       ยอดไลค์: ${videoStats.likeCount.toLocaleString()}
       ยอดคอมเมนต์: ${videoStats.commentCount.toLocaleString()}
       ความยาว: ${videoStats.duration}
       Average View Duration: ${analytics?.averageViewDuration || "N/A"}
       Average View Percentage: ${analytics?.averageViewPercentage || "N/A"}%
       
       เขียนเป็นภาษาไทย สรุปประสิทธิภาพและข้อเสนอแนะ:`
    : `Summarize the performance of this YouTube video briefly (2-3 sentences):
       
       Title: ${videoStats.title}
       Views: ${videoStats.viewCount.toLocaleString()}
       Likes: ${videoStats.likeCount.toLocaleString()}
       Comments: ${videoStats.commentCount.toLocaleString()}
       Duration: ${videoStats.duration}
       Average View Duration: ${analytics?.averageViewDuration || "N/A"}
       Average View Percentage: ${analytics?.averageViewPercentage || "N/A"}%
       
       Write a brief performance summary and recommendations:`;

  try {
    // Try Ollama first
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:4b",
        prompt,
        stream: false,
        options: { temperature: 0.7 },
      }),
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      return data.response.trim();
    }
  } catch {
    console.log("Ollama not available, using fallback summary");
  }

  // Fallback summary
  const engagementRate = ((videoStats.likeCount + videoStats.commentCount) / videoStats.viewCount * 100).toFixed(2);
  
  if (language === "th") {
    return `วิดีโอนี้มียอดวิว ${videoStats.viewCount.toLocaleString()} ครั้ง และมี engagement rate ${engagementRate}% ` +
           `${parseFloat(engagementRate) > 5 ? "ซึ่งถือว่าดีมาก" : parseFloat(engagementRate) > 2 ? "ซึ่งอยู่ในเกณฑ์ดี" : "ซึ่งมีโอกาสพัฒนาได้อีก"} ` +
           `คนดูเฉลี่ย ${analytics?.averageViewPercentage || 50}% ของวิดีโอ`;
  }
  
  return `This video has ${videoStats.viewCount.toLocaleString()} views with ${engagementRate}% engagement rate. ` +
         `${parseFloat(engagementRate) > 5 ? "This is excellent performance." : parseFloat(engagementRate) > 2 ? "This is good performance." : "There's room for improvement."} ` +
         `Average watch time is ${analytics?.averageViewPercentage || 50}% of the video.`;
}
