import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/nev/brands
 * ดึงรายชื่อแบรนด์รถ NEV ทั้งหมด
 */
export async function GET() {
  try {
    const brands = await prisma.nevBrand.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: { models: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching NEV brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nev/brands
 * เพิ่มแบรนด์ใหม่ (Admin only)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameTh, slug, logoUrl, country, website } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const brand = await prisma.nevBrand.create({
      data: {
        name,
        nameTh,
        slug,
        logoUrl,
        country,
        website,
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error creating NEV brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
