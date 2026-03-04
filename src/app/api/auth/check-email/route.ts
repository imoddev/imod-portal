import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/config";

// POST /api/auth/check-email - Check if email is allowed to login
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ allowed: false });
    }

    const lowerEmail = email.toLowerCase();
    const domain = lowerEmail.split("@")[1];

    // Check if public signup is enabled
    if (authConfig.allowPublicSignup) {
      return NextResponse.json({ allowed: true });
    }

    // Check if domain is in whitelist
    if (authConfig.allowedDomains.includes(domain)) {
      return NextResponse.json({ allowed: true, reason: "domain" });
    }

    // Check if email exists in Employee table
    const employee = await prisma.employee.findFirst({
      where: {
        email: {
          equals: lowerEmail,
          mode: "insensitive",
        },
      },
    });

    if (employee) {
      return NextResponse.json({ allowed: true, reason: "employee", employeeId: employee.id });
    }

    return NextResponse.json({ allowed: false });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json({ allowed: false, error: "Internal error" });
  }
}
