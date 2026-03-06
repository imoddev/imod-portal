import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/team/import - Bulk import employees
export async function POST(request: NextRequest) {
  try {
    const { employees, overwrite = false } = await request.json();

    if (!Array.isArray(employees)) {
      return NextResponse.json(
        { success: false, error: "employees must be an array" },
        { status: 400 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const emp of employees) {
      try {
        // Check if exists by email or discordId
        // Find existing by email or discordId
        let existing = null;
        if (emp.email) {
          existing = await prisma.employee.findFirst({
            where: { email: emp.email },
          });
        }
        if (!existing && emp.discordId) {
          existing = await prisma.employee.findFirst({
            where: { discordId: emp.discordId },
          });
        }

        if (existing) {
          if (overwrite) {
            const updateData: any = {
              name: emp.name,
              nickname: emp.nickname || null,
              phone: emp.phone || null,
              department: emp.department,
              jobTitle: emp.jobTitle || null,
              role: emp.role || "member",
              discordId: emp.discordId || null,
            };
            // Only add date fields if they exist in schema
            if (emp.birthDate) updateData.birthDate = new Date(emp.birthDate);
            if (emp.startDate) updateData.startDate = new Date(emp.startDate);
            
            await prisma.employee.update({
              where: { id: existing.id },
              data: updateData,
            });
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          const createData: any = {
            name: emp.name,
            nickname: emp.nickname || null,
            email: emp.email || null,
            phone: emp.phone || null,
            department: emp.department,
            jobTitle: emp.jobTitle || null,
            role: emp.role || "member",
            discordId: emp.discordId || null,
          };
          // Only add date fields if they exist in schema
          if (emp.birthDate) createData.birthDate = new Date(emp.birthDate);
          if (emp.startDate) createData.startDate = new Date(emp.startDate);
          
          await prisma.employee.create({
            data: createData,
          });
          results.created++;
        }
      } catch (err) {
        results.errors.push(`${emp.name}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error importing employees:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
