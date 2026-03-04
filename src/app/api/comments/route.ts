import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/comments - List comments for a target
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!targetType || !targetId) {
    return NextResponse.json(
      { success: false, error: "targetType and targetId required" },
      { status: 400 }
    );
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        targetType,
        targetId,
        parentId: null, // Top-level comments only
      },
      orderBy: { createdAt: "asc" },
    });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await prisma.comment.findMany({
          where: { parentId: comment.id },
          orderBy: { createdAt: "asc" },
        });
        return { ...comment, replies };
      })
    );

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      count: comments.length,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, targetId, authorId, authorName, content, parentId, mentions } = body;

    if (!targetType || !targetId || !authorId || !authorName || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        targetType,
        targetId,
        authorId,
        authorName,
        content,
        parentId,
        mentions: mentions ? JSON.stringify(mentions) : null,
      },
    });

    // Send notification for mentions
    if (mentions && mentions.length > 0) {
      const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:4141";
      
      for (const mentionId of mentions) {
        await fetch(`${gatewayUrl}/api/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            channel: "discord",
            target: mentionId,
            message: `💬 **${authorName}** mention คุณในความเห็น:\n\n"${content.substring(0, 200)}..."`,
          }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
