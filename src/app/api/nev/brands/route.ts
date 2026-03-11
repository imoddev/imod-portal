import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const brands = await prisma.nevBrand.findMany({
      include: {
        _count: {
          select: { models: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands', brands: [] },
      { status: 500 }
    );
  }
}
