import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Daily rates by location type
const DAILY_RATES: Record<string, number> = {
  local: 200,       // ภายในจังหวัด
  domestic: 400,    // ต่างจังหวัด
  international: 800, // ต่างประเทศ
};

// GET - List allowance requests
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

    const requests = await prisma.allowanceRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching allowance requests:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create allowance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      employeeId,
      employeeName,
      department,
      locationType,
      startDate,
      endDate,
      workDays,
      travelDays = 0,
      projectName,
      destination,
      description,
      requestOffDay = false,
    } = body;

    // Validate required fields
    if (!employeeId || !employeeName || !locationType || !startDate || !endDate || !workDays || !projectName || !destination) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get daily rate
    const dailyRate = DAILY_RATES[locationType] || 200;
    
    // Calculate total (only work days, not travel days!)
    const totalAmount = workDays * dailyRate;

    // Create allowance request
    const allowanceRequest = await prisma.allowanceRequest.create({
      data: {
        employeeId,
        employeeName,
        department,
        locationType,
        dailyRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workDays,
        travelDays,
        totalAmount,
        projectName,
        destination,
        description,
        requestOffDay,
        offDayStatus: requestOffDay ? "pending" : null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      request: allowanceRequest,
      message: "สร้างคำขอเบี้ยเลี้ยงสำเร็จ รอการอนุมัติ",
      calculation: {
        locationType,
        dailyRate,
        workDays,
        totalAmount,
        note: "เบี้ยเลี้ยงเหมาจ่ายสำหรับค่าอาหารและเครื่องดื่ม ไม่รวมค่าที่พักและค่าเดินทาง",
      },
    });
  } catch (error) {
    console.error("Error creating allowance request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject allowance request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      action,
      approvedBy,
      approverName,
      rejectReason,
      offDayAction, // approve/reject OFF DAY separately
    } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing id or action" },
        { status: 400 }
      );
    }

    const allowanceRequest = await prisma.allowanceRequest.findUnique({
      where: { id },
    });

    if (!allowanceRequest) {
      return NextResponse.json(
        { success: false, error: "Allowance request not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      const updateData: any = {
        status: "approved",
        approvedBy,
        approverName,
        approvedAt: new Date(),
      };

      // Handle OFF DAY approval if requested
      if (allowanceRequest.requestOffDay && offDayAction) {
        updateData.offDayStatus = offDayAction === "approve" ? "approved" : "rejected";
      }

      await prisma.allowanceRequest.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: "อนุมัติคำขอเบี้ยเลี้ยงสำเร็จ",
        offDayApproved: offDayAction === "approve",
      });
    } else if (action === "reject") {
      await prisma.allowanceRequest.update({
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
        message: "ปฏิเสธคำขอเบี้ยเลี้ยงสำเร็จ",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating allowance request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
