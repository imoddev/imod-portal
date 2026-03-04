import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr/overtime - List OT requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const status = searchParams.get("status");

  try {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status && status !== "all") where.status = status;

    const requests = await prisma.overtimeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ 
      success: true, 
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("Error fetching OT requests:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/hr/overtime - Create OT request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      employeeName,
      department,
      date,
      startTime,
      endTime,
      otType,
      reason,
      projectName,
    } = body;

    if (!employeeId || !employeeName || !date || !startTime || !endTime || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate hours
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const totalHours = (endH + endM / 60) - (startH + startM / 60);

    // Determine multiplier
    let multiplier = 1.5;
    if (otType === "holiday") multiplier = 2.0;
    if (otType === "special") multiplier = 3.0;

    const otRequest = await prisma.overtimeRequest.create({
      data: {
        employeeId,
        employeeName,
        department,
        date: new Date(date),
        startTime,
        endTime,
        totalHours,
        otType: otType || "normal",
        multiplier,
        reason,
        projectName,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      request: otRequest,
    });
  } catch (error) {
    console.error("Error creating OT request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
