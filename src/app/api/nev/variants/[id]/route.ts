import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/nev/variants/[id]
 * ดึงข้อมูลรุ่นย่อย + สเปคเต็ม
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const variant = await prisma.nevVariant.findUnique({
      where: { id: params.id },
      include: {
        model: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Parse features JSON if exists
    let parsedVariant = variant;
    if (variant.features) {
      try {
        parsedVariant = {
          ...variant,
          featuresData: JSON.parse(variant.features),
        };
      } catch {
        // Keep features as string if parsing fails
      }
    }

    return NextResponse.json(parsedVariant);
  } catch (error) {
    console.error('Error fetching NEV variant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}
