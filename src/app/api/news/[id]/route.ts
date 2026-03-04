import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/news/[id] - Get single news item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const news = await prisma.newsItem.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/news/[id] - Update news item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, draftUrl, publishedUrl, notes, claimedBy } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (draftUrl) updateData.draftUrl = draftUrl;
    if (publishedUrl) {
      updateData.publishedUrl = publishedUrl;
      updateData.publishedAt = new Date();
    }
    if (notes) updateData.notes = notes;
    if (claimedBy) {
      updateData.claimedBy = claimedBy;
      updateData.claimedAt = new Date();
    }

    const news = await prisma.newsItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/news/[id] - Delete news item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.newsItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
