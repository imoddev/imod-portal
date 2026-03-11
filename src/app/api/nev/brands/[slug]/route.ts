import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const brand = await prisma.nevBrand.findUnique({
      where: { slug },
      include: {
        models: {
          where: { isActive: true },
          include: {
            variants: {
              where: { isActive: true },
              orderBy: { priceBaht: 'asc' },
              select: {
                priceBaht: true,
                rangeKm: true,
                rangeStandard: true,
                motorHp: true,
                batteryKwh: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}
