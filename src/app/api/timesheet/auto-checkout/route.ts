import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/timesheet/auto-checkout
// Auto checkout all employees who forgot to checkout
// Should be called at 20:00 daily via cron
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all records that have checkIn but no checkOut for today
    const pendingRecords = await prisma.attendance.findMany({
      where: {
        date: today,
        checkIn: { not: null },
        checkOut: null,
      },
    });

    if (pendingRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending checkouts",
        count: 0,
      });
    }

    // Auto checkout time: 20:00
    const autoCheckoutTime = new Date();
    autoCheckoutTime.setHours(20, 0, 0, 0);

    const results = [];

    for (const record of pendingRecords) {
      const checkIn = record.checkIn ? new Date(record.checkIn) : autoCheckoutTime;
      const totalHours = (autoCheckoutTime.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      const otHours = Math.max(0, totalHours - 8);

      await prisma.attendance.update({
        where: { id: record.id },
        data: {
          checkOut: autoCheckoutTime,
          totalHours,
          otHours,
          notes: (record.notes || "") + " [ออกงานอัตโนมัติ 20:00]",
        },
      });

      results.push({
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        totalHours: totalHours.toFixed(1),
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          userId: "system",
          userName: "Auto Checkout System",
          action: "auto_checkout",
          targetType: "timesheet",
          targetId: record.id,
          targetTitle: `Auto checkout: ${record.employeeName}`,
          details: JSON.stringify({
            employeeId: record.employeeId,
            checkIn: record.checkIn,
            autoCheckoutTime,
            totalHours,
          }),
        },
      });
    }

    console.log(`[AUTO-CHECKOUT] Processed ${results.length} employees`);

    return NextResponse.json({
      success: true,
      message: `Auto checkout ${results.length} employees`,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error("Auto checkout error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET - Check status
export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingCount = await prisma.attendance.count({
    where: {
      date: today,
      checkIn: { not: null },
      checkOut: null,
    },
  });

  return NextResponse.json({
    pendingCheckouts: pendingCount,
    autoCheckoutTime: "20:00",
  });
}
