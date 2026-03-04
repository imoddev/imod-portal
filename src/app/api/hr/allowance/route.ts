import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr/allowance - List allowance requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const status = searchParams.get("status");

  try {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status && status !== "all") where.status = status;

    const requests = await prisma.allowanceRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate totals
    const totalApproved = requests
      .filter(r => r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({ 
      success: true, 
      requests,
      count: requests.length,
      totalApproved,
    });
  } catch (error) {
    console.error("Error fetching allowance requests:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/hr/allowance - Create allowance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      employeeName,
      department,
      allowanceType,
      date,
      amount,
      description,
      destination,
      receipt,
    } = body;

    if (!employeeId || !employeeName || !allowanceType || !date || !amount || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowanceRequest = await prisma.allowanceRequest.create({
      data: {
        employeeId,
        employeeName,
        department,
        allowanceType,
        date: new Date(date),
        amount: parseFloat(amount),
        description,
        destination,
        receipt,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      request: allowanceRequest,
    });
  } catch (error) {
    console.error("Error creating allowance request:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
