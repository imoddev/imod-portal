import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/hr/allowance/[id] - Update allowance request (approve/reject)
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

    const updatedRequest = await prisma.allowanceRequest.update({
      where: { id },
      data: {
        status,
        approvedBy,
        approvedAt: status === "approved" ? new Date() : null,
        rejectReason: status === "rejected" ? rejectReason : null,
      },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating allowance request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
