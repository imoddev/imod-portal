import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Late threshold: 09:15 (as per requirement)
const LATE_HOUR = 9;
const LATE_MINUTE = 15;

// Warning threshold
const WARNING_THRESHOLD = 3; // ครั้ง

// GET - Get late records/summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const summary = searchParams.get("summary") === "true";

    if (summary) {
      // Get monthly summary
      const summaries = await prisma.lateSummary.findMany({
        where: {
          ...(employeeId && { employeeId }),
          year,
          month,
        },
        orderBy: { lateCount: "desc" },
      });

      return NextResponse.json({ success: true, summaries });
    }

    // Get late records
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const records = await prisma.lateRecord.findMany({
      where: {
        ...(employeeId && { employeeId }),
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Error fetching late records:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Record late check-in (called from attendance check-in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, checkInTime } = body;

    if (!employeeId || !employeeName || !checkInTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInTime);
    const hour = checkIn.getHours();
    const minute = checkIn.getMinutes();

    // Check if late (after 09:15)
    const isLate = hour > LATE_HOUR || (hour === LATE_HOUR && minute > LATE_MINUTE);

    if (!isLate) {
      return NextResponse.json({
        success: true,
        isLate: false,
        message: "เข้างานตรงเวลา",
      });
    }

    // Calculate minutes late
    const lateMinutes = (hour - LATE_HOUR) * 60 + (minute - LATE_MINUTE);

    // Record late
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lateRecord = await prisma.lateRecord.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      update: {
        checkInTime: checkIn,
        minutesLate: lateMinutes,
      },
      create: {
        employeeId,
        employeeName,
        date: today,
        checkInTime: checkIn,
        minutesLate: lateMinutes,
      },
    });

    // Update monthly summary
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const summary = await prisma.lateSummary.upsert({
      where: {
        employeeId_year_month: {
          employeeId,
          year,
          month,
        },
      },
      update: {
        lateCount: { increment: 1 },
        totalMinutes: { increment: lateMinutes },
      },
      create: {
        employeeId,
        employeeName,
        year,
        month,
        lateCount: 1,
        totalMinutes: lateMinutes,
      },
    });

    // Check if warning needed (3 times)
    let warningIssued = false;
    if (summary.lateCount >= WARNING_THRESHOLD && !summary.warningAt) {
      // Issue warning
      await prisma.lateSummary.update({
        where: { id: summary.id },
        data: {
          warningAt: new Date(),
          warningTo: "HR", // TODO: Get manager
        },
      });
      warningIssued = true;

      // TODO: Send notification to HR/Manager
      console.log(`⚠️ WARNING: ${employeeName} มาสายครบ ${WARNING_THRESHOLD} ครั้งในเดือนนี้!`);
    }

    return NextResponse.json({
      success: true,
      isLate: true,
      minutesLate: lateMinutes,
      monthlyCount: summary.lateCount,
      warningIssued,
      message: `มาสาย ${lateMinutes} นาที (ครั้งที่ ${summary.lateCount} ในเดือนนี้)`,
    });
  } catch (error) {
    console.error("Error recording late:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
