import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr/leave - List leave requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const status = searchParams.get("status");
  const year = searchParams.get("year") || new Date().getFullYear().toString();

  try {
    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (status && status !== "all") where.status = status;
    
    // Filter by year
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);
    where.startDate = {
      gte: startOfYear,
      lte: endOfYear,
    };

    const requests = await prisma.leaveRequest.findMany({
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
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/hr/leave - Create leave request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      employeeName,
      department,
      leaveType,
      startDate,
      endDate,
      reason,
      attachment,
    } = body;

    if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        employeeName,
        department,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        attachment,
        status: "pending",
      },
    });

    // Send Discord notification to #townhall and #revenue-team
    try {
      const leaveTypeNames: Record<string, string> = {
        sick: "ลาป่วย",
        personal: "ลากิจ",
        annual: "ลาพักร้อน",
        maternity: "ลาคลอด",
        ordination: "ลาบวช",
        other: "อื่นๆ",
      };
      
      const message = `📋 **คำขอลาใหม่** รออนุมัติ\n\n` +
        `👤 **${employeeName}** (${department || "ไม่ระบุแผนก"})\n` +
        `📝 ประเภท: ${leaveTypeNames[leaveType] || leaveType}\n` +
        `📅 ${start.toLocaleDateString("th-TH")} - ${end.toLocaleDateString("th-TH")} (${totalDays} วัน)\n` +
        `💬 เหตุผล: ${reason}\n\n` +
        `🔗 อนุมัติได้ที่: https://basement.iphonemod.net/hr/admin`;

      // Notify via OpenClaw Gateway
      const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:4141";
      const channels = ["1467392002457866363"]; // #revenue-team
      
      for (const channelId of channels) {
        await fetch(`${gatewayUrl}/api/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            channel: "discord",
            target: channelId,
            message,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Discord notification failed:", e);
    }

    return NextResponse.json({
      success: true,
      request: leaveRequest,
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
