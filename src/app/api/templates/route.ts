import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/templates - List templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  try {
    const where: any = { isPublic: true };
    if (type) where.type = type;
    if (category) where.category = category;

    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { usageCount: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, content, variables, authorId, authorName, isPublic } = body;

    if (!name || !type || !content) {
      return NextResponse.json(
        { success: false, error: "Name, type, and content required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        type,
        category,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        authorId,
        authorName,
        isPublic: isPublic !== false,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
