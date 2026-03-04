import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Notification types
type NotificationType = 
  | "news_new"      // ข่าวใหม่เข้า
  | "news_assigned" // ได้รับมอบหมายข่าว
  | "draft_ready"   // Draft พร้อม review
  | "draft_approved"// Draft ได้รับอนุมัติ
  | "draft_rejected"// Draft ถูก reject
  | "article_published" // บทความ publish แล้ว
  | "leave_submitted"   // คำขอลาใหม่
  | "leave_approved"    // ลาได้รับอนุมัติ
  | "leave_rejected"    // ลาถูก reject
  | "ot_approved"       // OT ได้รับอนุมัติ
  | "asset_borrowed"    // ยืมอุปกรณ์
  | "asset_overdue"     // อุปกรณ์เกินกำหนดคืน
  | "mention"           // ถูก @mention
  | "system";           // ระบบ

interface SendNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  recipientId?: string;   // Discord ID or user ID
  recipientIds?: string[];
  channelId?: string;     // Discord channel
  link?: string;
  data?: any;
}

// Send notification helper
async function sendNotification(params: SendNotificationParams) {
  const { type, title, message, recipientId, recipientIds, channelId, link, data } = params;

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:4141";

  // Prepare Discord message
  const discordMessage = `${getEmoji(type)} **${title}**\n${message}` +
    (link ? `\n\n🔗 ${link}` : "");

  // Send to channel if specified
  if (channelId) {
    await fetch(`${gatewayUrl}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        channel: "discord",
        target: channelId,
        message: discordMessage,
      }),
    }).catch(() => {});
  }

  // Send DM to recipients
  const recipients = recipientIds || (recipientId ? [recipientId] : []);
  for (const id of recipients) {
    // DM via Discord
    await fetch(`${gatewayUrl}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        channel: "discord",
        target: id,
        message: discordMessage,
      }),
    }).catch(() => {});
  }

  return { sent: true };
}

function getEmoji(type: NotificationType): string {
  const emojis: Record<NotificationType, string> = {
    news_new: "📰",
    news_assigned: "📋",
    draft_ready: "📝",
    draft_approved: "✅",
    draft_rejected: "❌",
    article_published: "📢",
    leave_submitted: "🏖️",
    leave_approved: "✅",
    leave_rejected: "❌",
    ot_approved: "⏰",
    asset_borrowed: "📦",
    asset_overdue: "⚠️",
    mention: "💬",
    system: "🔔",
  };
  return emojis[type] || "🔔";
}

// POST /api/notifications - Send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await sendNotification(body);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Helper function for other APIs to use
export { sendNotification };
