import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/team/[id] - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/team/[id] - Update employee
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      nickname,
      email,
      phone,
      department,
      jobTitle,
      role,
      discordId,
      lineId,
      profileImage,
      birthDate,
      startDate,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nickname !== undefined) updateData.nickname = nickname || null;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (department !== undefined) updateData.department = department;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle || null;
    if (role !== undefined) updateData.role = role;
    if (discordId !== undefined) updateData.discordId = discordId || null;
    if (lineId !== undefined) updateData.lineId = lineId || null;
    if (profileImage !== undefined) updateData.profileImage = profileImage || null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
