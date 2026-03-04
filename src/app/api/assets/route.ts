import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/assets - List all assets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  try {
    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        borrowings: {
          where: { status: "borrowed" },
          take: 1,
        },
      },
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    });

    // Summary
    const summary = {
      total: assets.length,
      available: assets.filter(a => a.status === "available").length,
      inUse: assets.filter(a => a.status === "in-use").length,
      maintenance: assets.filter(a => a.status === "maintenance").length,
    };

    return NextResponse.json({
      success: true,
      assets,
      summary,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      brand,
      model,
      serialNumber,
      status,
      condition,
      purchaseDate,
      purchasePrice,
      location,
      notes,
      image,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: "Name and category are required" },
        { status: 400 }
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        category,
        brand,
        model,
        serialNumber,
        status: status || "available",
        condition: condition || "good",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        location,
        notes,
        image,
      },
    });

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
