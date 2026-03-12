import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/nev/variants/[slug]
 * ดึงข้อมูลรุ่นย่อย + สเปคเต็ม
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const variant = await prisma.nevVariant.findUnique({
      where: { slug },
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
    const response: any = { ...variant };
    if (variant.features) {
      try {
        response.featuresData = JSON.parse(variant.features);
      } catch {
        // Keep features as string if parsing fails
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching NEV variant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}
