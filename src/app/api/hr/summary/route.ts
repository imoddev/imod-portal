import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr/summary - Get HR summary for payroll/expense
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM
  const employeeId = searchParams.get("employeeId");

  try {
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [y, m] = month.split("-").map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0, 23, 59, 59);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const where: any = {
      status: "approved",
      date: { gte: startDate, lte: endDate },
    };
    if (employeeId) where.employeeId = employeeId;

    // Fetch all approved requests
    const [overtimeRequests, allowanceRequests, attendanceRecords] = await Promise.all([
      prisma.overtimeRequest.findMany({
        where: { ...where, status: "approved" },
      }),
      prisma.allowanceRequest.findMany({
        where: { ...where, status: "approved" },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          ...(employeeId ? { employeeId } : {}),
        },
      }),
    ]);

    // Calculate OT hours and pay (assuming 100 baht/hour base)
    const otSummary = overtimeRequests.reduce((acc, req) => {
      const key = req.employeeId;
      if (!acc[key]) {
        acc[key] = { name: req.employeeName, hours: 0, amount: 0 };
      }
      const baseRate = 100; // TODO: Get from employee salary
      const amount = req.totalHours * baseRate * req.multiplier;
      acc[key].hours += req.totalHours;
      acc[key].amount += amount;
      return acc;
    }, {} as Record<string, { name: string; hours: number; amount: number }>);

    // Calculate allowance
    const allowanceSummary = allowanceRequests.reduce((acc, req) => {
      const key = req.employeeId;
      if (!acc[key]) {
        acc[key] = { name: req.employeeName, total: 0, byType: {} as Record<string, number> };
      }
      acc[key].total += req.amount;
      acc[key].byType[req.allowanceType] = (acc[key].byType[req.allowanceType] || 0) + req.amount;
      return acc;
    }, {} as Record<string, { name: string; total: number; byType: Record<string, number> }>);

    // Calculate attendance
    const attendanceSummary = attendanceRecords.reduce((acc, rec) => {
      const key = rec.employeeId;
      if (!acc[key]) {
        acc[key] = { name: rec.employeeName, days: 0, hours: 0, otHours: 0 };
      }
      acc[key].days += 1;
      acc[key].hours += rec.totalHours || 0;
      acc[key].otHours += rec.otHours || 0;
      return acc;
    }, {} as Record<string, { name: string; days: number; hours: number; otHours: number }>);

    // Totals
    const totals = {
      otHours: Object.values(otSummary).reduce((sum, o) => sum + o.hours, 0),
      otAmount: Object.values(otSummary).reduce((sum, o) => sum + o.amount, 0),
      allowanceTotal: Object.values(allowanceSummary).reduce((sum, a) => sum + a.total, 0),
      workDays: attendanceRecords.length,
      workHours: attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    };

    // Allowance by type
    const allowanceByType = allowanceRequests.reduce((acc, req) => {
      acc[req.allowanceType] = (acc[req.allowanceType] || 0) + req.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      month: month || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
      totals,
      allowanceByType,
      byEmployee: {
        overtime: otSummary,
        allowance: allowanceSummary,
        attendance: attendanceSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching HR summary:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
