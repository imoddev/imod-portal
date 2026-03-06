import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/team - List all employees
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const active = searchParams.get("active");
  const email = searchParams.get("email");

  try {
    const where: any = {};
    if (department) where.department = department;
    if (active !== null) where.isActive = active !== "false";
    if (email) {
      where.email = { equals: email, mode: "insensitive" };
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: [
        { department: "asc" },
        { name: "asc" },
      ],
    });

    // Group by department
    const grouped = employees.reduce((acc: any, emp) => {
      if (!acc[emp.department]) acc[emp.department] = [];
      acc[emp.department].push(emp);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      employees,
      grouped,
      count: employees.length,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/team - Create employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      discordId,
      email,
      name,
      nickname,
      department,
      jobTitle,
      role,
      phone,
      lineId,
      profileImage,
      managerId,
      startDate,
      birthDate,
    } = body;

    if (!name || !department) {
      return NextResponse.json(
        { success: false, error: "Name and department are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        discordId,
        email,
        name,
        nickname,
        department,
        jobTitle,
        role: role || "member",
        phone,
        lineId,
        profileImage,
        managerId,
        startDate: startDate ? new Date(startDate) : null,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
