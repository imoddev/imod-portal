import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET - List leave requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const pending = searchParams.get("pending") === "true";

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (pending) where.status = "pending";

    const requests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create leave request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
      isEmergency = false,
    } = body;

    // Validate required fields
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
    const consecutiveDays = totalDays;

    // Check if document required (sick leave > 3 days)
    const requiresDocument = leaveType === "sick" && consecutiveDays > 3;

    // Validate sick leave > 3 days requires attachment
    if (requiresDocument && !attachment) {
      return NextResponse.json(
        { success: false, error: "ลาป่วยเกิน 3 วัน ต้องแนบใบรับรองแพทย์" },
        { status: 400 }
      );
    }

    // Check quota
    const year = new Date().getFullYear();
    let balance = await prisma.leaveBalance.findUnique({
      where: { employeeId_year: { employeeId, year } },
    });

    // Create balance if not exists
    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: { employeeId, employeeName, year },
      });
    }

    // Validate quota based on leave type
    const quotaMap: Record<string, { quota: string; used: string }> = {
      sick: { quota: "sickLeaveQuota", used: "sickLeaveUsed" },
      personal: { quota: "personalLeaveQuota", used: "personalLeaveUsed" },
      annual: { quota: "annualLeaveQuota", used: "annualLeaveUsed" },
      wedding: { quota: "weddingLeaveQuota", used: "weddingLeaveUsed" },
      ordination: { quota: "ordinationLeaveQuota", used: "ordinationLeaveUsed" },
      childSick: { quota: "childSickLeaveQuota", used: "childSickLeaveUsed" },
    };

    const mapping = quotaMap[leaveType];
    if (mapping) {
      const quota = (balance as any)[mapping.quota];
      const used = (balance as any)[mapping.used];
      const remaining = quota - used;

      if (totalDays > remaining) {
        return NextResponse.json(
          { success: false, error: `โควตาไม่เพียงพอ (เหลือ ${remaining} วัน)` },
          { status: 400 }
        );
      }

      // Check one-time leaves
      if (leaveType === "wedding" && balance.hasUsedWeddingLeave) {
        return NextResponse.json(
          { success: false, error: "ใช้สิทธิ์ลาแต่งงานไปแล้ว (1 ครั้งตลอดอายุงาน)" },
          { status: 400 }
        );
      }
      if (leaveType === "ordination" && balance.hasUsedOrdinationLeave) {
        return NextResponse.json(
          { success: false, error: "ใช้สิทธิ์ลาบวชไปแล้ว (1 ครั้งตลอดอายุงาน)" },
          { status: 400 }
        );
      }
    }

    // TODO: Check annual leave requires 1 year employment

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        employeeName,
        department,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        reason,
        attachment,
        isEmergency,
        consecutiveDays,
        requiresDocument,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      request: leaveRequest,
      message: "สร้างคำขอลาสำเร็จ รอการอนุมัติ",
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject leave request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, approvedBy, approverName, rejectReason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing id or action" },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Update request status
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "approved",
          approvedBy,
          approverName,
          approvedAt: new Date(),
        },
      });

      // Update balance
      const year = new Date().getFullYear();
      const usedField = `${leaveRequest.leaveType}LeaveUsed`;
      
      await prisma.leaveBalance.update({
        where: {
          employeeId_year: {
            employeeId: leaveRequest.employeeId,
            year,
          },
        },
        data: {
          [usedField]: { increment: leaveRequest.totalDays },
          // Mark one-time leaves
          ...(leaveRequest.leaveType === "wedding" && { hasUsedWeddingLeave: true }),
          ...(leaveRequest.leaveType === "ordination" && { hasUsedOrdinationLeave: true }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "อนุมัติคำขอลาสำเร็จ",
      });
    } else if (action === "reject") {
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "rejected",
          approvedBy,
          approverName,
          rejectReason,
        },
      });

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธคำขอลาสำเร็จ",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
