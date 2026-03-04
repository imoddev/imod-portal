import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { IMOD_OFFICE, getLocationStatus } from "@/lib/geo-utils";

// Get client IP from request headers
async function getClientIp(request: NextRequest): Promise<string> {
  const headersList = await headers();
  
  // Check various headers for client IP
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return "unknown";
}

// GET /api/timesheet - List attendance records
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const date = searchParams.get("date");
  const month = searchParams.get("month"); // YYYY-MM

  try {
    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    } else if (month) {
      const [y, m] = month.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
    });

    // Calculate summary
    const summary = {
      totalDays: records.length,
      officeDays: records.filter(r => r.workType === "office").length,
      wfhDays: records.filter(r => r.workType === "wfh").length,
      fieldDays: records.filter(r => r.workType === "field").length,
      totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
      totalOT: records.reduce((sum, r) => sum + (r.otHours || 0), 0),
      verifiedDays: records.filter(r => r.locationStatus === "verified").length,
      suspiciousDays: records.filter(r => r.locationStatus === "suspicious").length,
    };

    return NextResponse.json({
      success: true,
      records,
      summary,
    });
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/timesheet - Check in/out
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      employeeName,
      action, // checkin, checkout
      workType,
      location,
      notes,
      // Location data
      latitude,
      longitude,
      accuracy,
      distance,
      isWithinOffice,
    } = body;

    if (!employeeId || !employeeName || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get client IP
    const clientIp = await getClientIp(request);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's record
    let record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });

    const now = new Date();

    if (action === "checkin") {
      if (record) {
        return NextResponse.json({
          success: false,
          error: "วันนี้ลงเวลาเข้างานแล้ว",
        }, { status: 400 });
      }

      // Determine location status
      let locationStatus: string = "unavailable";
      
      if (latitude !== undefined && longitude !== undefined) {
        const status = getLocationStatus(workType || "office", latitude, longitude);
        locationStatus = status.status;
      } else if (workType === "wfh") {
        locationStatus = "remote";
      }

      record = await prisma.attendance.create({
        data: {
          employeeId,
          employeeName,
          date: today,
          checkIn: now,
          workType: workType || "office",
          location,
          notes,
          // Location verification
          checkInLat: latitude,
          checkInLng: longitude,
          checkInAccuracy: accuracy,
          checkInIp: clientIp,
          checkInDistance: distance,
          locationStatus,
        },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          userId: employeeId,
          userName: employeeName,
          action: "checkin",
          targetType: "timesheet",
          targetId: record.id,
          targetTitle: `Check-in: ${workType}`,
          details: JSON.stringify({
            workType,
            latitude,
            longitude,
            distance,
            isWithinOffice,
            locationStatus,
          }),
          ipAddress: clientIp,
        },
      });
      
    } else if (action === "checkout") {
      if (!record) {
        return NextResponse.json({
          success: false,
          error: "ยังไม่ได้ลงเวลาเข้างาน",
        }, { status: 400 });
      }

      if (record.checkOut) {
        return NextResponse.json({
          success: false,
          error: "วันนี้ลงเวลาออกแล้ว",
        }, { status: 400 });
      }

      // Calculate hours
      const checkIn = record.checkIn ? new Date(record.checkIn) : now;
      const totalHours = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      const otHours = Math.max(0, totalHours - 8); // OT = hours over 8

      record = await prisma.attendance.update({
        where: { id: record.id },
        data: {
          checkOut: now,
          totalHours: Math.round(totalHours * 100) / 100,
          otHours: Math.round(otHours * 100) / 100,
          notes: notes || record.notes,
          // Check-out location
          checkOutLat: latitude,
          checkOutLng: longitude,
          checkOutIp: clientIp,
        },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          userId: employeeId,
          userName: employeeName,
          action: "checkout",
          targetType: "timesheet",
          targetId: record.id,
          targetTitle: `Check-out: ${totalHours.toFixed(1)}h`,
          details: JSON.stringify({
            totalHours,
            otHours,
            latitude,
            longitude,
          }),
          ipAddress: clientIp,
        },
      });
    }

    return NextResponse.json({
      success: true,
      record,
      message: action === "checkin" ? "ลงเวลาเข้างานสำเร็จ" : "ลงเวลาออกสำเร็จ",
    });
  } catch (error) {
    console.error("Error updating timesheet:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
