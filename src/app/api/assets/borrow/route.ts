import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/assets/borrow - Borrow or return asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action, // borrow, return
      assetId,
      borrowerId,
      borrowerName,
      dueDate,
      purpose,
      projectName,
      condition,
      notes,
    } = body;

    if (!action || !assetId) {
      return NextResponse.json(
        { success: false, error: "Action and assetId are required" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    if (action === "borrow") {
      if (asset.status !== "available") {
        return NextResponse.json(
          { success: false, error: "อุปกรณ์ไม่ว่าง" },
          { status: 400 }
        );
      }

      if (!borrowerId || !borrowerName) {
        return NextResponse.json(
          { success: false, error: "Borrower info required" },
          { status: 400 }
        );
      }

      // Create borrowing record
      const borrowing = await prisma.assetBorrowing.create({
        data: {
          assetId,
          borrowerId,
          borrowerName,
          borrowDate: new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          purpose,
          projectName,
          status: "borrowed",
        },
      });

      // Update asset status
      await prisma.asset.update({
        where: { id: assetId },
        data: { status: "in-use" },
      });

      return NextResponse.json({
        success: true,
        borrowing,
        message: "ยืมอุปกรณ์สำเร็จ",
      });

    } else if (action === "return") {
      // Find active borrowing
      const borrowing = await prisma.assetBorrowing.findFirst({
        where: {
          assetId,
          status: "borrowed",
        },
      });

      if (!borrowing) {
        return NextResponse.json(
          { success: false, error: "ไม่พบรายการยืม" },
          { status: 400 }
        );
      }

      // Update borrowing
      await prisma.assetBorrowing.update({
        where: { id: borrowing.id },
        data: {
          returnDate: new Date(),
          status: "returned",
          condition,
          notes,
        },
      });

      // Update asset
      await prisma.asset.update({
        where: { id: assetId },
        data: {
          status: "available",
          condition: condition || asset.condition,
        },
      });

      return NextResponse.json({
        success: true,
        message: "คืนอุปกรณ์สำเร็จ",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing borrow:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
