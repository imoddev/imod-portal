import { prisma } from "@/lib/prisma";
import { authConfig } from "./config";

// Check if email is allowed to login
// 1. Check allowed domains (e.g. @modmedia.asia)
// 2. Check if email exists in Employee table
export async function isEmailAllowed(email: string): Promise<boolean> {
  const lowerEmail = email.toLowerCase();
  const domain = lowerEmail.split("@")[1];

  // If public signup is enabled, allow everyone
  if (authConfig.allowPublicSignup) {
    return true;
  }

  // Check if domain is in whitelist
  if (authConfig.allowedDomains.includes(domain)) {
    return true;
  }

  // Check if email exists in Employee table
  try {
    const employee = await prisma.employee.findFirst({
      where: {
        email: {
          equals: lowerEmail,
          mode: "insensitive",
        },
      },
    });

    if (employee) {
      return true;
    }
  } catch (error) {
    console.error("Error checking employee email:", error);
  }

  return false;
}
