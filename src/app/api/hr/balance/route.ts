import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr/balance - Get leave balance
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  try {
    if (employeeId) {
      // Get specific employee's balance
      let balance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_year: {
            employeeId,
            year,
          },
        },
      });

      // If no balance exists, create default
      if (!balance) {
        return NextResponse.json({
          success: true,
          balance: {
            employeeId,
            year,
            sickLeaveQuota: 30,
            personalLeaveQuota: 6,
            annualLeaveQuota: 6,
            sickLeaveUsed: 0,
            personalLeaveUsed: 0,
            annualLeaveUsed: 0,
            sickLeaveRemaining: 30,
            personalLeaveRemaining: 6,
            annualLeaveRemaining: 6,
          },
        });
      }

      return NextResponse.json({
        success: true,
        balance: {
          ...balance,
          sickLeaveRemaining: balance.sickLeaveQuota - balance.sickLeaveUsed,
          personalLeaveRemaining: balance.personalLeaveQuota - balance.personalLeaveUsed,
          annualLeaveRemaining: balance.annualLeaveQuota - balance.annualLeaveUsed,
        },
      });
    }

    // Get all balances
    const balances = await prisma.leaveBalance.findMany({
      where: { year },
      orderBy: { employeeName: "asc" },
    });

    return NextResponse.json({
      success: true,
      balances: balances.map(b => ({
        ...b,
        sickLeaveRemaining: b.sickLeaveQuota - b.sickLeaveUsed,
        personalLeaveRemaining: b.personalLeaveQuota - b.personalLeaveUsed,
        annualLeaveRemaining: b.annualLeaveQuota - b.annualLeaveUsed,
      })),
    });
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/hr/balance - Create or update leave balance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      employeeName,
      year,
      sickLeaveQuota,
      personalLeaveQuota,
      annualLeaveQuota,
    } = body;

    if (!employeeId || !employeeName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const currentYear = year || new Date().getFullYear();

    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_year: {
          employeeId,
          year: currentYear,
        },
      },
      update: {
        employeeName,
        sickLeaveQuota: sickLeaveQuota ?? 30,
        personalLeaveQuota: personalLeaveQuota ?? 6,
        annualLeaveQuota: annualLeaveQuota ?? 6,
      },
      create: {
        employeeId,
        employeeName,
        year: currentYear,
        sickLeaveQuota: sickLeaveQuota ?? 30,
        personalLeaveQuota: personalLeaveQuota ?? 6,
        annualLeaveQuota: annualLeaveQuota ?? 6,
      },
    });

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error("Error updating leave balance:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
