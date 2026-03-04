import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/timesheet/today - Get today's attendance
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all attendance records for today
    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { checkIn: "asc" },
    });

    // Get employee details for each attendance
    const employeeIds = attendance.map(a => a.employeeId);
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { id: { in: employeeIds } },
          { discordId: { in: employeeIds } },
        ],
      },
    });

    // Map employee data to attendance
    const attendanceWithEmployee = attendance.map(a => {
      const emp = employees.find(e => e.id === a.employeeId || e.discordId === a.employeeId);
      
      // Calculate late status (assuming work starts at 9:00 AM)
      const workStartHour = 9;
      const checkInTime = a.checkIn ? new Date(a.checkIn) : null;
      let lateMinutes = 0;
      let isLate = false;
      
      if (checkInTime) {
        const expectedStart = new Date(today);
        expectedStart.setHours(workStartHour, 0, 0, 0);
        
        if (checkInTime > expectedStart) {
          lateMinutes = Math.round((checkInTime.getTime() - expectedStart.getTime()) / 60000);
          isLate = true;
        }
      }

      return {
        id: a.id,
        employeeId: a.employeeId,
        employeeName: emp?.name || a.employeeId,
        employeeNickname: emp?.nickname,
        department: emp?.department,
        profileImage: emp?.profileImage,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        workType: a.workType,
        isLate,
        lateMinutes,
        totalHours: a.totalHours,
        notes: a.notes,
      };
    });

    // Count by work type
    const summary = {
      total: attendance.length,
      office: attendance.filter(a => a.workType === "office").length,
      wfh: attendance.filter(a => a.workType === "wfh").length,
      field: attendance.filter(a => a.workType === "field").length,
      late: attendanceWithEmployee.filter(a => a.isLate).length,
      checkedOut: attendance.filter(a => a.checkOut).length,
    };

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      attendance: attendanceWithEmployee,
      summary,
    });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
