import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List OT requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const pending = searchParams.get("pending") === "true";

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (pending) where.status = { in: ["pending", "pre-approved"] };

    const requests = await prisma.overtimeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching OT requests:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create OT request (Pre-approval required!)
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
      reason,
      projectName,
      isOffsite = false,
      location,
    } = body;

    // Validate required fields
    if (!employeeId || !employeeName || !date || !startTime || !endTime || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate hours
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const plannedHours = (endH + endM/60) - (startH + startM/60);

    if (plannedHours <= 0) {
      return NextResponse.json(
        { success: false, error: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม" },
        { status: 400 }
      );
    }

    // Check if date is holiday/weekend
    const otDate = new Date(date);
    const dayOfWeek = otDate.getDay();
    const isHoliday = dayOfWeek === 0 || dayOfWeek === 6; // Sat=6, Sun=0
    // TODO: Check public holidays from a table
    
    const multiplier = isHoliday ? 2.0 : 1.5;
    const otType = isHoliday ? "holiday" : "normal";

    // Create OT request
    const otRequest = await prisma.overtimeRequest.create({
      data: {
        employeeId,
        employeeName,
        department,
        date: otDate,
        startTime,
        endTime,
        plannedHours,
        otType,
        multiplier,
        isHoliday,
        reason,
        projectName,
        isOffsite,
        location,
        status: "pending",
        preApproved: false,
      },
    });

    return NextResponse.json({
      success: true,
      request: otRequest,
      message: "สร้างคำขอ OT สำเร็จ รอการอนุมัติล่วงหน้า",
      note: "⚠️ OT จะไม่ถูกคำนวณหากไม่ได้รับการอนุมัติก่อนเริ่มงาน",
    });
  } catch (error) {
    console.error("Error creating OT request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Pre-approve / Complete / Reject OT request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      action,
      approvedBy,
      approverName,
      rejectReason,
      actualHours,
      breakMinutes,
      adjustedHours,
      adjustedNote,
    } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing id or action" },
        { status: 400 }
      );
    }

    const otRequest = await prisma.overtimeRequest.findUnique({
      where: { id },
    });

    if (!otRequest) {
      return NextResponse.json(
        { success: false, error: "OT request not found" },
        { status: 404 }
      );
    }

    if (action === "pre-approve") {
      // Pre-approval before work starts
      await prisma.overtimeRequest.update({
        where: { id },
        data: {
          status: "pre-approved",
          preApproved: true,
          preApprovedBy: approvedBy,
          preApprovedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "อนุมัติ OT ล่วงหน้าสำเร็จ",
      });
    } else if (action === "complete") {
      // Check if pre-approved
      if (!otRequest.preApproved) {
        return NextResponse.json(
          { success: false, error: "OT นี้ไม่ได้รับการอนุมัติล่วงหน้า ไม่สามารถคำนวณเงิน OT ได้" },
          { status: 400 }
        );
      }

      // Calculate final hours (subtract break time)
      const finalHours = adjustedHours || (actualHours || otRequest.plannedHours) - (breakMinutes || 0) / 60;

      await prisma.overtimeRequest.update({
        where: { id },
        data: {
          status: "completed",
          actualHours: actualHours || otRequest.plannedHours,
          breakMinutes: breakMinutes || 0,
          adjustedHours: finalHours,
          adjustedNote,
          approvedBy,
          approverName,
          approvedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "บันทึก OT สำเร็จ",
        finalHours,
        multiplier: otRequest.multiplier,
      });
    } else if (action === "reject") {
      await prisma.overtimeRequest.update({
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
        message: "ปฏิเสธคำขอ OT สำเร็จ",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating OT request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
