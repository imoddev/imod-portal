import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const brandName = searchParams.get('brand'); // Support ?brand=Tesla

    let whereClause: any = undefined;

    if (brandId) {
      whereClause = { brandId };
    } else if (brandName) {
      // Filter by brand name
      whereClause = {
        brand: {
          name: brandName,
        },
      };
    }

    const models = await prisma.nevModel.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        nameTh: true,
        slug: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
