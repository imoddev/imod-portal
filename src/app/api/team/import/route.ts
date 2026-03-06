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
        const existing = await prisma.employee.findFirst({
          where: {
            OR: [
              emp.email ? { email: emp.email } : {},
              emp.discordId ? { discordId: emp.discordId } : {},
            ].filter(o => Object.keys(o).length > 0),
          },
        });

        if (existing) {
          if (overwrite) {
            await prisma.employee.update({
              where: { id: existing.id },
              data: {
                name: emp.name,
                nickname: emp.nickname || null,
                phone: emp.phone || null,
                department: emp.department,
                jobTitle: emp.jobTitle || null,
                role: emp.role || "member",
                birthDate: emp.birthDate ? new Date(emp.birthDate) : null,
                startDate: emp.startDate ? new Date(emp.startDate) : null,
                discordId: emp.discordId || null,
              },
            });
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          await prisma.employee.create({
            data: {
              name: emp.name,
              nickname: emp.nickname || null,
              email: emp.email || null,
              phone: emp.phone || null,
              department: emp.department,
              jobTitle: emp.jobTitle || null,
              role: emp.role || "member",
              birthDate: emp.birthDate ? new Date(emp.birthDate) : null,
              startDate: emp.startDate ? new Date(emp.startDate) : null,
              discordId: emp.discordId || null,
            },
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
