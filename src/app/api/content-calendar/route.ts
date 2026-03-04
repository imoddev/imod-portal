import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/content-calendar - List content plans
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get("site");
  const status = searchParams.get("status");
  const month = searchParams.get("month"); // YYYY-MM
  const assigneeId = searchParams.get("assigneeId");

  try {
    const where: any = {};
    
    if (site) where.site = site;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);
      where.plannedDate = { gte: start, lte: end };
    }

    const plans = await prisma.contentPlan.findMany({
      where,
      orderBy: { plannedDate: "asc" },
    });

    // Summary
    const summary = {
      total: plans.length,
      planned: plans.filter(p => p.status === "planned").length,
      writing: plans.filter(p => p.status === "writing").length,
      editing: plans.filter(p => p.status === "editing").length,
      published: plans.filter(p => p.status === "published").length,
    };

    return NextResponse.json({
      success: true,
      plans,
      summary,
    });
  } catch (error) {
    console.error("Error fetching content plans:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/content-calendar - Create content plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      site,
      category,
      plannedDate,
      assigneeId,
      assigneeName,
      type,
      status,
      sourceUrl,
      priority,
      notes,
    } = body;

    if (!title || !site || !plannedDate) {
      return NextResponse.json(
        { success: false, error: "Title, site, and plannedDate are required" },
        { status: 400 }
      );
    }

    const plan = await prisma.contentPlan.create({
      data: {
        title,
        site,
        category,
        plannedDate: new Date(plannedDate),
        assigneeId,
        assigneeName,
        type: type || "article",
        status: status || "planned",
        sourceUrl,
        priority: priority || "normal",
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error creating content plan:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
