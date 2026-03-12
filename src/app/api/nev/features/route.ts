import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/nev/features - รายการ Features ทั้งหมด (จัดกลุ่มตาม Category)
export async function GET() {
  try {
    const categories = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.name,
        c."nameTh",
        c.icon,
        c."sortOrder",
        json_agg(
          json_build_object(
            'id', f.id,
            'name', f.name,
            'nameTh', f."nameTh",
            'description', f.description,
            'isStandard', f."isStandard",
            'sortOrder', f."sortOrder"
          ) ORDER BY f."sortOrder"
        ) FILTER (WHERE f.id IS NOT NULL) as features
      FROM "NevFeatureCategory" c
      LEFT JOIN "NevFeature" f ON f."categoryId" = c.id
      GROUP BY c.id, c.name, c."nameTh", c.icon, c."sortOrder"
      ORDER BY c."sortOrder"
    `;

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}

// POST /api/nev/features - เพิ่ม Feature ใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, name, nameTh, description } = body;

    if (!categoryId || !name || !nameTh) {
      return NextResponse.json(
        { error: 'categoryId, name, and nameTh are required' },
        { status: 400 }
      );
    }

    const id = 'c' + Math.random().toString(36).substring(2, 15);
    
    await prisma.$executeRaw`
      INSERT INTO "NevFeature" ("id", "categoryId", "name", "nameTh", "description", "isStandard", "sortOrder")
      VALUES (${id}, ${categoryId}, ${name}, ${nameTh}, ${description || null}, false, 999)
    `;

    return NextResponse.json({ 
      success: true, 
      feature: { id, categoryId, name, nameTh, description, isStandard: false } 
    });
  } catch (error: any) {
    console.error('Error creating feature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create feature' },
      { status: 500 }
    );
  }
}
