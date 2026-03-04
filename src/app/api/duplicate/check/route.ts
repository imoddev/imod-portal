import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkDuplicate } from "@/lib/duplicate-checker";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, site = "both" } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const result = await checkDuplicate(title, site);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return NextResponse.json(
      { error: "Failed to check duplicate" },
      { status: 500 }
    );
  }
}
