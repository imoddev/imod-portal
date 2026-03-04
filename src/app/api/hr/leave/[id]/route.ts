import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/hr/leave/[id] - Update leave request (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedBy, rejectReason } = body;

    if (!status || !["approved", "rejected", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get current request to update leave balance
    const currentRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Update request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedBy,
        approvedAt: status === "approved" ? new Date() : null,
        rejectReason: status === "rejected" ? rejectReason : null,
      },
    });

    // If approved, update leave balance
    if (status === "approved") {
      const year = new Date(currentRequest.startDate).getFullYear();
      const leaveType = currentRequest.leaveType;
      
      // Map leave type to field
      const fieldMap: Record<string, string> = {
        sick: "sickLeaveUsed",
        personal: "personalLeaveUsed",
        annual: "annualLeaveUsed",
      };

      const field = fieldMap[leaveType];
      if (field) {
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_year: {
              employeeId: currentRequest.employeeId,
              year,
            },
          },
          update: {
            [field]: { increment: currentRequest.totalDays },
          },
          create: {
            employeeId: currentRequest.employeeId,
            employeeName: currentRequest.employeeName,
            year,
            [field]: currentRequest.totalDays,
          },
        });
      }
    }

    // Send Discord notification to #townhall and #revenue-team
    try {
      const statusEmoji = status === "approved" ? "✅" : "❌";
      const statusText = status === "approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ";
      
      const message = `${statusEmoji} **คำขอลาของ ${currentRequest.employeeName}** ${statusText}\n` +
        `📅 ${new Date(currentRequest.startDate).toLocaleDateString("th-TH")} - ${new Date(currentRequest.endDate).toLocaleDateString("th-TH")}\n` +
        `🗓️ ${currentRequest.totalDays} วัน\n` +
        `👤 อนุมัติโดย: ${approvedBy || "Admin"}` +
        (rejectReason ? `\n📝 เหตุผล: ${rejectReason}` : "");

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
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating leave request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
