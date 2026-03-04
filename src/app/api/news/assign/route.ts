import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/news/assign - Assign news to writer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newsId, assigneeId, assigneeName, assignedBy } = body;

    if (!newsId || !assigneeId || !assigneeName) {
      return NextResponse.json(
        { success: false, error: "News ID, assignee ID and name required" },
        { status: 400 }
      );
    }

    // Update news item
    const news = await prisma.newsItem.update({
      where: { id: newsId },
      data: {
        status: "claimed",
        claimedBy: assigneeName,
        claimedAt: new Date(),
        notes: `Assigned by ${assignedBy || "Admin"} to ${assigneeName}`,
      },
    });

    // Send Discord notification to assignee
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:4141";
    
    // Notify assignee via DM
    await fetch(`${gatewayUrl}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        channel: "discord",
        target: assigneeId,
        message: `📋 **คุณได้รับมอบหมายข่าวใหม่!**\n\n` +
          `📰 **${news.title}**\n` +
          `📂 หมวด: ${news.category}\n` +
          `🔗 ${news.sourceUrl}\n\n` +
          `ดูได้ที่: https://basement.iphonemod.net/content/news`,
      }),
    }).catch(() => {});

    // Notify team channel
    const channelId = news.team === "ev" ? "1467136835208609827" : "1467136896391188560";
    await fetch(`${gatewayUrl}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        channel: "discord",
        target: channelId,
        message: `📋 **มอบหมายข่าว**\n\n` +
          `📰 ${news.title}\n` +
          `👤 มอบหมายให้: ${assigneeName}\n` +
          `📅 กำหนดส่ง: พรุ่งนี้`,
      }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Assign error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
